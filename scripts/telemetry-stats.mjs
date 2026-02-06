#!/usr/bin/env node

/**
 * Telemetry Stats Script
 *
 * Fetches and displays statistics from Firestore telemetry collections.
 * Uses Firebase CLI credentials for authentication.
 *
 * Usage: node scripts/telemetry-stats.mjs
 */

import https from "https";
import os from "os";
import fs from "fs";
import path from "path";

const PROJECT_ID = "vierkantescaperoom";

// Load Firebase CLI credentials
function getRefreshToken() {
  const configPath = path.join(os.homedir(), ".config/configstore/firebase-tools.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  return (config.tokens || config.user?.tokens).refresh_token;
}

// Exchange refresh token for access token
function getAccessToken(refreshToken) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
      client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
    }).toString();

    const req = https.request({
      hostname: "oauth2.googleapis.com",
      path: "/token",
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        const parsed = JSON.parse(data);
        if (parsed.access_token) resolve(parsed.access_token);
        else reject(new Error(parsed.error_description || "Failed to get token"));
      });
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

// Fetch all documents from a Firestore collection (handles pagination)
function fetchCollection(token, collection) {
  return new Promise(async (resolve) => {
    let allDocs = [];
    let pageToken = null;

    do {
      const result = await new Promise((res) => {
        let urlPath = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?pageSize=300`;
        if (pageToken) urlPath += `&pageToken=${encodeURIComponent(pageToken)}`;

        const req = https.request({
          hostname: "firestore.googleapis.com",
          path: urlPath,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }, (r) => {
          let data = "";
          r.on("data", (chunk) => data += chunk);
          r.on("end", () => res(JSON.parse(data)));
        });
        req.end();
      });

      if (result.error) {
        console.error(`Error fetching ${collection}:`, result.error.message);
        resolve(allDocs);
        return;
      }

      allDocs = allDocs.concat(result.documents || []);
      pageToken = result.nextPageToken;
    } while (pageToken);

    resolve(allDocs);
  });
}

// Helper to format numbers with dots as thousands separator
function fmt(n) {
  return n.toLocaleString("nl-NL");
}

// Main
async function main() {
  console.log("Fetching telemetry data...\n");

  const token = await getAccessToken(getRefreshToken());

  const [analyticsDocs, leaderboardDocs, prizeDocs, errorDocs] = await Promise.all([
    fetchCollection(token, "telemetry-analytics"),
    fetchCollection(token, "leaderbord-kamp-a"),
    fetchCollection(token, "prizes-kamp-a"),
    fetchCollection(token, "telemetry-errors"),
  ]);

  // Process analytics
  let totalPuzzleStarts = 0;
  let totalPuzzleCompletes = 0;
  let totalGameCompletes = 0;
  const sessionsByDay = {};

  for (const doc of analyticsDocs) {
    const events = doc.fields?.events?.arrayValue?.values || [];
    const createdAt = doc.fields?.createdAt?.timestampValue;

    if (createdAt) {
      const day = new Date(createdAt).toISOString().slice(0, 10);
      sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
    }

    for (const evt of events) {
      const type = evt.mapValue?.fields?.type?.stringValue;
      if (type === "puzzle_start") totalPuzzleStarts++;
      if (type === "puzzle_complete") totalPuzzleCompletes++;
      if (type === "game_complete") totalGameCompletes++;
    }
  }

  // Process leaderboard by day
  const leaderboardByDay = {};
  for (const doc of leaderboardDocs) {
    const ts = doc.fields?.createdAt?.timestampValue;
    if (ts) {
      const day = new Date(ts).toISOString().slice(0, 10);
      leaderboardByDay[day] = (leaderboardByDay[day] || 0) + 1;
    }
  }

  // Process prizes by day + breakdown
  const prizesByDay = {};
  const campPref = {};
  const groups = {};
  for (const doc of prizeDocs) {
    const ts = doc.fields?.createdAt?.timestampValue;
    if (ts) {
      const day = new Date(ts).toISOString().slice(0, 10);
      prizesByDay[day] = (prizesByDay[day] || 0) + 1;
    }
    const pref = doc.fields?.campPreference?.stringValue;
    if (pref) campPref[pref] = (campPref[pref] || 0) + 1;
    const grp = doc.fields?.eligibilityGroup?.integerValue;
    if (grp) groups[grp] = (groups[grp] || 0) + 1;
  }

  // Output
  console.log("=".repeat(50));
  console.log("TELEMETRY STATS");
  console.log("=".repeat(50));

  console.log("\n📊 Totaaloverzicht");
  console.log(`   Spellen gestart:  ${fmt(analyticsDocs.length)}`);
  console.log(`   Puzzels gestart:  ${fmt(totalPuzzleStarts)}`);
  console.log(`   Puzzels voltooid: ${fmt(totalPuzzleCompletes)}`);
  console.log(`   Spellen voltooid: ${fmt(totalGameCompletes)}`);
  console.log(`   Errors gelogd:    ${fmt(errorDocs.length)}`);

  console.log("\n📅 Sessies per dag");
  for (const day of Object.keys(sessionsByDay).sort()) {
    console.log(`   ${day}: ${fmt(sessionsByDay[day])}`);
  }

  console.log("\n🏆 Leaderboard");
  console.log(`   Totaal: ${fmt(leaderboardDocs.length)}`);
  for (const day of Object.keys(leaderboardByDay).sort()) {
    console.log(`   ${day}: ${fmt(leaderboardByDay[day])}`);
  }

  console.log("\n🎁 Prijzen");
  console.log(`   Totaal: ${fmt(prizeDocs.length)}`);
  for (const day of Object.keys(prizesByDay).sort()) {
    console.log(`   ${day}: ${fmt(prizesByDay[day])}`);
  }
  if (Object.keys(campPref).length) {
    console.log(`   Kampvoorkeur: ${Object.entries(campPref).map(([k, v]) => `${v}x ${k}`).join(", ")}`);
  }
  if (Object.keys(groups).length) {
    console.log(`   Groepen: ${Object.entries(groups).sort((a, b) => b[0] - a[0]).map(([k, v]) => `${v}x gr.${k}`).join(", ")}`);
  }

  // Summary
  console.log("\n📈 Samenvatting");
  const pctLeaderboard = ((leaderboardDocs.length / totalGameCompletes) * 100).toFixed(0);
  const pctPrizes = ((prizeDocs.length / totalGameCompletes) * 100).toFixed(0);
  const pctNothing = (100 - pctLeaderboard - pctPrizes).toFixed(0);
  console.log(`   Van de ${fmt(totalGameCompletes)} die het spel uitspeelden:`);
  console.log(`   • ${fmt(leaderboardDocs.length)} (${pctLeaderboard}%) op het leaderboard`);
  console.log(`   • ${fmt(prizeDocs.length)} (${pctPrizes}%) mee voor de prijzen`);
  console.log(`   • ~${pctNothing}% niks ingevuld`);

  console.log("\n" + "=".repeat(50));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

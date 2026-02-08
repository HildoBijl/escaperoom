#!/usr/bin/env node

/**
 * Telemetry Stats Script
 *
 * Reads local JSON data (fetched by fetch-telemetry.mjs) and displays statistics.
 *
 * Usage: node scripts/telemetry-stats.mjs
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "data");

function readJSON(name) {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing ${filePath} — run fetch-telemetry.mjs first`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Helper to format numbers with dots as thousands separator
function fmt(n) {
  return n.toLocaleString("nl-NL");
}

function main() {
  const analyticsDocs = readJSON("telemetry-analytics");
  const leaderboardDocs = readJSON("leaderbord-kamp-a");
  const prizeDocs = readJSON("prizes-kamp-a");
  const errorDocs = readJSON("telemetry-errors");

  // Process analytics
  let totalPuzzleStarts = 0;
  let totalPuzzleCompletes = 0;
  let totalGameCompletes = 0;
  const sessionsByDay = {};

  for (const doc of analyticsDocs) {
    const events = doc.events || [];

    if (doc.createdAt) {
      const day = new Date(doc.createdAt).toISOString().slice(0, 10);
      sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
    }

    for (const evt of events) {
      if (evt.type === "puzzle_start") totalPuzzleStarts++;
      if (evt.type === "puzzle_complete") totalPuzzleCompletes++;
      if (evt.type === "game_complete") totalGameCompletes++;
    }
  }

  // Process leaderboard by day
  const leaderboardByDay = {};
  for (const doc of leaderboardDocs) {
    if (doc.createdAt) {
      const day = new Date(doc.createdAt).toISOString().slice(0, 10);
      leaderboardByDay[day] = (leaderboardByDay[day] || 0) + 1;
    }
  }

  // Process prizes by day + breakdown
  const prizesByDay = {};
  const campPref = {};
  const groups = {};
  for (const doc of prizeDocs) {
    if (doc.createdAt) {
      const day = new Date(doc.createdAt).toISOString().slice(0, 10);
      prizesByDay[day] = (prizesByDay[day] || 0) + 1;
    }
    if (doc.campPreference) campPref[doc.campPreference] = (campPref[doc.campPreference] || 0) + 1;
    if (doc.eligibilityGroup) groups[doc.eligibilityGroup] = (groups[doc.eligibilityGroup] || 0) + 1;
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

main();

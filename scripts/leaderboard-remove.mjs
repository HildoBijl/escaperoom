#!/usr/bin/env node

/**
 * Remove leaderboard entries by document ID.
 *
 * The leaderboard is a public guestbook that children fill in themselves, so
 * every so often something turns up that should not stay. Security rules block
 * deletes from the client on purpose (`allow update, delete: if false`), so
 * this goes through the REST API with your Firebase CLI credentials, which act
 * with your IAM permissions and are not subject to those rules.
 *
 * Generate the list to review with the report in scripts/output; this script
 * takes the IDs you picked.
 *
 * Every document is fetched and printed before anything is removed, and the
 * expected name must match -- an ID alone is too easy to get wrong, and a
 * mistake here is not recoverable.
 *
 * Usage:
 *   node scripts/leaderboard-remove.mjs <id>:<verwachte naam> ...
 *   node scripts/leaderboard-remove.mjs --file <pad>     (één per regel)
 *   node scripts/leaderboard-remove.mjs ... --commit     (zonder: proefdraai)
 *
 * Without --commit it only reports what it would do.
 */

import https from "https";
import os from "os";
import fs from "fs";
import path from "path";

const PROJECT_ID = "vierkantescaperoom";
const COLLECTION = "leaderbord-kamp-a";
const BASE = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}`;

// ---------------------------------------------------------------- auth
// Same approach as fetch-telemetry.mjs: reuse the Firebase CLI login.
function getRefreshToken() {
  const configPath = path.join(os.homedir(), ".config/configstore/firebase-tools.json");
  if (!fs.existsSync(configPath)) {
    throw new Error("Firebase CLI-config niet gevonden. Log eerst in: npx firebase-tools login");
  }
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const token = (config.tokens || config.user?.tokens)?.refresh_token;
  if (!token) throw new Error("Geen refresh token in de Firebase CLI-config.");
  return token;
}

function getAccessToken(refreshToken) {
  const postData = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "oauth2.googleapis.com",
      path: "/token",
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          parsed.access_token
            ? resolve(parsed.access_token)
            : reject(new Error(parsed.error_description || "Token ophalen mislukt"));
        } catch (err) {
          reject(new Error(`OAuth-antwoord onleesbaar: ${err.message}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("OAuth-verzoek duurde te lang")));
    req.write(postData);
    req.end();
  });
}

// ---------------------------------------------------------------- firestore
function request(token, method, docPath) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "firestore.googleapis.com",
      path: docPath,
      method,
      headers: { Authorization: `Bearer ${token}` },
    }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("Firestore-verzoek duurde te lang")));
    req.end();
  });
}

// ---------------------------------------------------------------- input
function parseTargets(argv) {
  const fileIdx = argv.indexOf("--file");
  const lines = fileIdx !== -1
    ? fs.readFileSync(argv[fileIdx + 1], "utf8").split("\n")
    : argv.filter((a) => !a.startsWith("--") && a !== argv[fileIdx + 1]);

  return lines
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf(":");
      if (i === -1) throw new Error(`Verwacht <id>:<naam>, kreeg: ${l}`);
      return { id: l.slice(0, i).trim(), verwacht: l.slice(i + 1).trim() };
    });
}

// ---------------------------------------------------------------- main
const commit = process.argv.includes("--commit");
const targets = parseTargets(process.argv.slice(2));

if (!targets.length) {
  console.error("Geen documenten opgegeven. Zie de usage bovenaan dit bestand.");
  process.exit(1);
}

const token = await getAccessToken(getRefreshToken());

console.log(commit
  ? `VERWIJDEREN — ${targets.length} document(en)\n`
  : `PROEFDRAAI — ${targets.length} document(en), er wordt niets gewijzigd\n`);

let verwijderd = 0, overgeslagen = 0;

for (const { id, verwacht } of targets) {
  const res = await request(token, "GET", `${BASE}/${id}`);

  if (res.status === 404) {
    console.log(`  overslaan  ${id}  — bestaat niet (al verwijderd?)`);
    overgeslagen++;
    continue;
  }
  if (res.status !== 200) {
    console.log(`  overslaan  ${id}  — ophalen mislukte (HTTP ${res.status})`);
    overgeslagen++;
    continue;
  }

  const naam = JSON.parse(res.body).fields?.name?.stringValue ?? "";

  // The review list truncates to 20 characters, so compare on that prefix.
  if (!naam.startsWith(verwacht.slice(0, 20))) {
    console.log(`  OVERSLAAN  ${id}  — naam wijkt af!`);
    console.log(`             verwacht: "${verwacht}"`);
    console.log(`             gevonden: "${naam}"`);
    overgeslagen++;
    continue;
  }

  if (!commit) {
    console.log(`  zou weg    ${id}  — "${naam}"`);
    continue;
  }

  const del = await request(token, "DELETE", `${BASE}/${id}`);
  if (del.status === 200) {
    console.log(`  verwijderd ${id}  — "${naam}"`);
    verwijderd++;
  } else {
    console.log(`  MISLUKT    ${id}  — HTTP ${del.status} ${del.body.slice(0, 120)}`);
    overgeslagen++;
  }
}

console.log(commit
  ? `\nKlaar: ${verwijderd} verwijderd, ${overgeslagen} overgeslagen.`
  : `\nProefdraai klaar. Voeg --commit toe om het echt te doen.`);

#!/usr/bin/env node

/**
 * Speedrun Top 10 (or more)
 *
 * Shows the fastest game completions (new games only, no resumes).
 * Matches each run to a leaderboard entry to show name + age.
 *
 * Usage:
 *   node scripts/fetch-telemetry.mjs   # refresh data first
 *   node scripts/speedrun-top.mjs      # show top 10
 *   node scripts/speedrun-top.mjs 50   # show top 50
 */

import fs from "fs";
import path from "path";

const __dirname = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(__dirname, "data");
const ANALYTICS_PATH = path.join(DATA_DIR, "telemetry-analytics.json");
const LEADERBOARD_PATH = path.join(DATA_DIR, "leaderbord-kamp-a.json");

const TOP_N = parseInt(process.argv[2]) || 10;

if (!fs.existsSync(ANALYTICS_PATH) || !fs.existsSync(LEADERBOARD_PATH)) {
  console.error("Geen data gevonden. Draai eerst: node scripts/fetch-telemetry.mjs");
  process.exit(1);
}

const analytics = JSON.parse(fs.readFileSync(ANALYTICS_PATH, "utf8"));
const leaderboard = JSON.parse(fs.readFileSync(LEADERBOARD_PATH, "utf8"));

// --- Build fastest new-game completions, deduplicated by sessionId ---

const bySession = new Map();

for (const session of analytics) {
  if (!session.events) continue;

  const gs = session.events.find(
    (e) => e.type === "game_start" && (e.mode === "new" || e.mode === "new_first"),
  );
  const gc = session.events.find((e) => e.type === "game_complete");
  if (!gs || !gc) continue;

  const dur = gc.timestamp - gs.timestamp;
  if (dur <= 0) continue;

  const existing = bySession.get(session.sessionId);
  if (!existing || dur < existing.dur) {
    bySession.set(session.sessionId, {
      dur,
      sessionCreatedAt: session.createdAt,
    });
  }
}

// --- Sort by duration and deduplicate by player ---
// Multiple runs by the same person: keep only their fastest

const sorted = [...bySession.values()].sort((a, b) => a.dur - b.dur);

// --- Match each run to a leaderboard entry ---

// Pre-sort leaderboard by createdAt for efficient matching
const lbSorted = leaderboard
  .map((e) => ({ ...e, ts: new Date(e.createdAt).getTime() }))
  .sort((a, b) => a.ts - b.ts);

function findLeaderboardMatch(sessionCreatedAt) {
  const sessionTs = new Date(sessionCreatedAt).getTime();
  // Leaderboard entry is submitted shortly after game_complete,
  // and session createdAt is the last flush time.
  // Look for an entry within -1 min to +10 min of session time.
  for (const entry of lbSorted) {
    const diff = entry.ts - sessionTs;
    if (diff > 600_000) break; // too far ahead
    if (diff >= -60_000 && diff <= 600_000) return entry;
  }
  return null;
}

function formatDuration(ms) {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

// --- Build results ---

const usedLbIds = new Set();
const results = [];

for (const run of sorted) {
  if (results.length >= TOP_N) break;

  const match = findLeaderboardMatch(run.sessionCreatedAt);

  // Skip duplicate leaderboard matches (same person, keep only fastest)
  if (match && usedLbIds.has(match.id)) continue;
  if (match) usedLbIds.add(match.id);

  const rawName = match?.name ?? "—";
  results.push({
    rank: results.length + 1,
    name: rawName.length > 25 ? rawName.slice(0, 22) + "..." : rawName,
    age: match?.age ?? "—",
    time: formatDuration(run.dur),
    date: run.sessionCreatedAt?.slice(0, 10) ?? "—",
  });
}

// --- Print table ---

// Compute column widths
const cols = {
  rank: { header: "#", width: 3 },
  name: { header: "Naam", width: Math.min(25, Math.max(4, ...results.map((r) => String(r.name).length))) },
  age: { header: "Leeftijd", width: 8 },
  time: { header: "Tijd", width: 7 },
  date: { header: "Datum", width: 10 },
};

function pad(str, width) {
  return String(str).padEnd(width);
}
function padR(str, width) {
  return String(str).padStart(width);
}

const header =
  `${padR(cols.rank.header, cols.rank.width)}  ` +
  `${pad(cols.name.header, cols.name.width)}  ` +
  `${padR(cols.age.header, cols.age.width)}  ` +
  `${padR(cols.time.header, cols.time.width)}  ` +
  `${pad(cols.date.header, cols.date.width)}`;

const separator = "─".repeat(header.length);

console.log();
console.log(header);
console.log(separator);

for (const r of results) {
  console.log(
    `${padR(r.rank, cols.rank.width)}  ` +
    `${pad(r.name, cols.name.width)}  ` +
    `${padR(r.age, cols.age.width)}  ` +
    `${padR(r.time, cols.time.width)}  ` +
    `${pad(r.date, cols.date.width)}`,
  );
}

console.log();
console.log(`${results.length} van ${bySession.size} unieke nieuwe completions`);

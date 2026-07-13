#!/usr/bin/env node
import path from "path";
import { scanNdjson } from "./lib/ndjson.mjs";

const __dirname = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(__dirname, "data");

// Stream analytics and deduplicate by sessionId on the fly
const bySession = new Map();
await scanNdjson(path.join(DATA_DIR, "telemetry-analytics.ndjson"), (doc) => {
  const sid = doc.sessionId;
  if (!sid) return;
  const existing = bySession.get(sid);
  if (!existing || (doc.events || []).length > (existing.events || []).length) {
    bySession.set(sid, doc);
  }
});

// Collect all wrong answers
const wrongAnswers = {};
for (const doc of bySession.values()) {
  for (const evt of (doc.events || [])) {
    if (evt.type !== "puzzle_attempt_fail") continue;
    if (!evt.givenAnswer) continue;
    const key = evt.puzzle || "unknown";
    if (!wrongAnswers[key]) wrongAnswers[key] = {};
    wrongAnswers[key][evt.givenAnswer] = (wrongAnswers[key][evt.givenAnswer] || 0) + 1;
  }
}

const puzzleOrder = [
  "LogicTower", "LogicTower_1", "LogicTower_2", "LogicTower_3", "LogicTower_4", "LogicTower_5",
  "SudokuScene", "PhoneBoxScene", "SlotScene", "StreakMaze",
];

for (const puzzle of puzzleOrder) {
  const answers = wrongAnswers[puzzle];
  if (!answers) continue;
  const sorted = Object.entries(answers).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, e) => sum + e[1], 0);
  console.log(`=== ${puzzle} (${total} foute pogingen) ===`);
  for (const [answer, count] of sorted) {
    console.log(`  ${String(count).padStart(4)}x  "${answer}"`);
  }
  console.log("");
}

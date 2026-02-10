#!/usr/bin/env node
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "data");
const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "telemetry-analytics.json"), "utf8"));

// Deduplicate by sessionId
const bySession = new Map();
for (const doc of data) {
  const sid = doc.sessionId;
  if (!sid) continue;
  const existing = bySession.get(sid);
  if (!existing || (doc.events || []).length > (existing.events || []).length) {
    bySession.set(sid, doc);
  }
}

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

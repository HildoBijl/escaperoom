#!/usr/bin/env node

/**
 * Telemetry Stats Script
 *
 * Reads local NDJSON data (fetched by fetch-telemetry.mjs) and displays statistics.
 * Deduplicates by sessionId (takes the document with the most events per session).
 *
 * Usage: node scripts/telemetry-stats.mjs
 */

import fs from "fs";
import path from "path";
import { scanNdjson, readNdjsonAll } from "./lib/ndjson.mjs";

const __dirname = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(__dirname, "data");

async function readCollection(name) {
  const filePath = path.join(DATA_DIR, `${name}.ndjson`);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing ${filePath} — run fetch-telemetry.mjs first`);
    return [];
  }
  return await readNdjsonAll(filePath);
}

/**
 * Stream telemetry-analytics.ndjson and deduplicate on the fly: for each
 * sessionId keep the doc with the most events. Peak memory is proportional
 * to the number of unique sessions, not the full file.
 */
async function streamAndDedupSessions() {
  const filePath = path.join(DATA_DIR, "telemetry-analytics.ndjson");
  if (!fs.existsSync(filePath)) {
    console.error(`Missing ${filePath} — run fetch-telemetry.mjs first`);
    return { sessions: [], rawCount: 0 };
  }
  const bySession = new Map();
  let rawCount = 0;
  await scanNdjson(filePath, (doc) => {
    rawCount++;
    const sid = doc.sessionId;
    if (!sid) return;
    const existing = bySession.get(sid);
    if (!existing || (doc.events || []).length > (existing.events || []).length) {
      bySession.set(sid, doc);
    }
  });
  return { sessions: [...bySession.values()], rawCount };
}

function fmt(n) {
  return n.toLocaleString("nl-NL");
}

function pct(n, total) {
  if (total === 0) return "0%";
  return ((n / total) * 100).toFixed(0) + "%";
}

const DAY_NAMES = ["zo", "ma", "di", "wo", "do", "vr", "za"];

function allDaysSince(startDate) {
  const days = [];
  const now = new Date();
  const cur = new Date(startDate + "T00:00:00");
  while (cur <= now) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function dayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${dateStr} (${DAY_NAMES[d.getDay()]})`;
}

// Map scene keys to canonical puzzle names for consistent reporting
const SCENE_TO_PUZZLE = {
  ShipFuelScene: "ship_fuel",
  LogicTower: "logic_tower",
  LogicTower_1: "logic_tower",
  LogicTower_2: "logic_tower",
  LogicTower_3: "logic_tower",
  LogicTower_4: "logic_tower",
  LogicTower_5: "logic_tower",
  PhoneBoxScene: "phone_box",
  SudokuScene: "sudoku",
  StreakMaze: "streak_maze",
  SlotScene: "slot",
  DominoScene: "domino",
  TangramSelectScene: "tangram",
  TangramKikkerScene: "tangram",
  TangramKrabScene: "tangram",
  TangramSchildpadScene: "tangram",
  kvq_antwoorden_invullen: "kist_van_quadratus",
  kvq_driehoeken: "kist_van_quadratus",
  kvq_som_1: "kist_van_quadratus",
  kvq_eieren: "kist_van_quadratus",
  kvq_oneven: "kist_van_quadratus",
  kvq_fruit: "kist_van_quadratus",
  kvq_vierkant: "kist_van_quadratus",
};

function canonicalPuzzle(sceneKey) {
  return SCENE_TO_PUZZLE[sceneKey] || sceneKey;
}

async function main() {
  const { sessions, rawCount } = await streamAndDedupSessions();
  const leaderboardDocs = await readCollection("leaderbord-kamp-a");
  const prizeDocs = await readCollection("prizes-kamp-a");
  const errorDocs = await readCollection("telemetry-errors");

  // Collect all events from deduplicated sessions
  let totalPuzzleStarts = 0;
  let totalPuzzleCompletes = 0;
  let totalGameCompletes = 0;
  let totalGameStarts = 0;
  let totalAttemptFails = 0;
  let totalAbandons = 0;
  const sessionsByDay = {};
  const puzzleCompletions = {};
  const puzzleStarts = {};
  const puzzleAbandons = {};
  const puzzleAttemptFails = {};
  const substepCompletions = {};
  const wrongAnswers = {}; // puzzle -> answer -> count
  const playerIds = new Set();
  const infoTabs = {};
  const linkClicks = {};
  const gameStartModes = {};

  for (const doc of sessions) {
    const events = doc.events || [];

    if (doc.playerId) playerIds.add(doc.playerId);

    if (doc.createdAt) {
      const day = new Date(doc.createdAt).toISOString().slice(0, 10);
      sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
    }

    for (const evt of events) {
      if (evt.type === "puzzle_start") {
        totalPuzzleStarts++;
        const key = canonicalPuzzle(evt.puzzle || "unknown");
        puzzleStarts[key] = (puzzleStarts[key] || 0) + 1;
      }
      if (evt.type === "puzzle_complete") {
        totalPuzzleCompletes++;
        const key = evt.puzzleKey || canonicalPuzzle(evt.puzzle || "unknown");
        puzzleCompletions[key] = (puzzleCompletions[key] || 0) + 1;
      }
      if (evt.type === "game_complete") totalGameCompletes++;
      if (evt.type === "game_start") {
        totalGameStarts++;
        const mode = evt.mode || "unknown";
        gameStartModes[mode] = (gameStartModes[mode] || 0) + 1;
      }
      if (evt.type === "puzzle_attempt_fail") {
        totalAttemptFails++;
        const key = evt.puzzle || "unknown"; // keep scene key for wrong answers detail
        const canonical = canonicalPuzzle(key);
        puzzleAttemptFails[canonical] = (puzzleAttemptFails[canonical] || 0) + 1;
        if (evt.givenAnswer) {
          if (!wrongAnswers[key]) wrongAnswers[key] = {};
          wrongAnswers[key][evt.givenAnswer] = (wrongAnswers[key][evt.givenAnswer] || 0) + 1;
        }
      }
      if (evt.type === "puzzle_abandon") {
        totalAbandons++;
        const key = canonicalPuzzle(evt.puzzle || "unknown");
        puzzleAbandons[key] = (puzzleAbandons[key] || 0) + 1;
      }
      if (evt.type === "substep_complete") {
        const label = `${evt.puzzle}/${evt.substep}`;
        substepCompletions[label] = (substepCompletions[label] || 0) + 1;
      }
      if (evt.type === "info_tab_open") {
        const tab = evt.tab || "unknown";
        infoTabs[tab] = (infoTabs[tab] || 0) + 1;
      }
      if (evt.type === "external_link_click") {
        const url = evt.url || "unknown";
        linkClicks[url] = (linkClicks[url] || 0) + 1;
      }
    }
  }

  // Output
  console.log("=".repeat(60));
  console.log("TELEMETRY STATS");
  console.log("=".repeat(60));

  console.log(`\n(${fmt(rawCount)} documents → ${fmt(sessions.length)} unieke sessies na deduplicatie)`);

  // Split v1/v2
  const v2Sessions = sessions.filter(d => d.playerId);
  const v1Sessions = sessions.filter(d => !d.playerId);

  // --- Overview ---
  console.log("\n--- Totaaloverzicht ---");
  console.log(`   Unieke sessies:   ${fmt(sessions.length)} (${fmt(v1Sessions.length)} v1 + ${fmt(v2Sessions.length)} v2)`);
  console.log(`   Unieke spelers:   ${fmt(playerIds.size)} (alleen v2 — v1 heeft geen playerId)`);
  console.log(`   Games gestart:    ${fmt(totalGameStarts)}${Object.keys(gameStartModes).length ? ` (${Object.entries(gameStartModes).map(([k, v]) => `${v}x ${k}`).join(", ")})` : ""} (alleen v2)`);
  console.log(`   Puzzels gestart:  ${fmt(totalPuzzleStarts)}`);
  console.log(`   Puzzels voltooid: ${fmt(totalPuzzleCompletes)}`);
  console.log(`   Foute pogingen:   ${fmt(totalAttemptFails)} (alleen v2)`);
  console.log(`   Puzzels verlaten: ${fmt(totalAbandons)} (alleen v2)`);
  console.log(`   Spellen voltooid: ${fmt(totalGameCompletes)}`);
  console.log(`   Errors gelogd:    ${fmt(errorDocs.length)}`);

  // --- Per puzzle ---
  console.log("\n--- Per puzzel: gestart / voltooid / verlaten / foute pogingen ---");
  const allPuzzleKeys = new Set([
    ...Object.keys(puzzleStarts),
    ...Object.keys(puzzleCompletions),
    ...Object.keys(puzzleAbandons),
  ]);
  for (const key of [...allPuzzleKeys].sort((a, b) => (puzzleStarts[b] || 0) - (puzzleStarts[a] || 0))) {
    const starts = puzzleStarts[key] || 0;
    const completions = puzzleCompletions[key] || 0;
    const abandons = puzzleAbandons[key] || 0;
    const fails = puzzleAttemptFails[key] || 0;
    const completePct = starts > 0 ? pct(completions, starts) : "-";
    const abandonPct = starts > 0 ? pct(abandons, starts) : "-";
    console.log(`   ${key.padEnd(28)} ${String(starts).padStart(5)} gestart  ${String(completions).padStart(5)} voltooid (${completePct})  ${String(abandons).padStart(4)} verlaten (${abandonPct})  ${String(fails).padStart(4)} fout`);
  }

  // --- Puzzle completions ---
  console.log("\n--- Puzzels opgelost ---");
  for (const [key, count] of Object.entries(puzzleCompletions).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${fmt(count).padStart(6)}  ${key}`);
  }

  // --- Substeps ---
  if (Object.keys(substepCompletions).length) {
    console.log("\n--- Substeps voltooid ---");
    for (const [label, count] of Object.entries(substepCompletions).sort()) {
      console.log(`   ${label.padEnd(30)} ${fmt(count)}`);
    }
  }

  // --- Top wrong answers ---
  if (Object.keys(wrongAnswers).length) {
    console.log("\n--- Veelvoorkomende foute antwoorden (top 5 per puzzel) ---");
    for (const [puzzle, answers] of Object.entries(wrongAnswers).sort()) {
      const sorted = Object.entries(answers).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (sorted.length === 0) continue;
      console.log(`   ${puzzle}:`);
      for (const [answer, count] of sorted) {
        console.log(`      ${String(count).padStart(4)}x  "${answer}"`);
      }
    }
  }

  // --- Info tabs & links ---
  if (Object.keys(infoTabs).length) {
    console.log("\n--- Info-tabs geopend ---");
    for (const [tab, count] of Object.entries(infoTabs).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${fmt(count).padStart(6)}  ${tab}`);
    }
  }
  if (Object.keys(linkClicks).length) {
    console.log("\n--- Externe links geklikt ---");
    for (const [url, count] of Object.entries(linkClicks).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${fmt(count).padStart(6)}  ${url}`);
    }
  }

  // --- Sessions per day ---
  const allDays = allDaysSince("2026-02-02");
  console.log("\n--- Sessies per dag ---");
  for (const day of allDays) {
    console.log(`   ${dayLabel(day)}: ${fmt(sessionsByDay[day] || 0)}`);
  }

  // --- Leaderboard ---
  const leaderboardByDay = {};
  for (const doc of leaderboardDocs) {
    if (doc.createdAt) {
      const day = new Date(doc.createdAt).toISOString().slice(0, 10);
      leaderboardByDay[day] = (leaderboardByDay[day] || 0) + 1;
    }
  }

  console.log("\n--- Leaderboard ---");
  console.log(`   Totaal: ${fmt(leaderboardDocs.length)}`);
  for (const day of allDays) {
    console.log(`   ${dayLabel(day)}: ${fmt(leaderboardByDay[day] || 0)}`);
  }

  // --- Prizes ---
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

  console.log("\n--- Prijzen ---");
  console.log(`   Totaal: ${fmt(prizeDocs.length)}`);
  for (const day of allDays) {
    console.log(`   ${dayLabel(day)}: ${fmt(prizesByDay[day] || 0)}`);
  }
  if (Object.keys(campPref).length) {
    console.log(`   Kampvoorkeur: ${Object.entries(campPref).map(([k, v]) => `${v}x ${k}`).join(", ")}`);
  }
  if (Object.keys(groups).length) {
    console.log(`   Groepen: ${Object.entries(groups).sort((a, b) => b[0] - a[0]).map(([k, v]) => `${v}x gr.${k}`).join(", ")}`);
  }

  // --- Funnel (all-time, using events available in both v1 and v2) ---
  console.log("\n--- Funnel (alle sessies, v1+v2) ---");
  const funnelAllSteps = [
    ["Pagina bezocht (sessies)", sessions.length],
    ["ShipFuel opgelost", puzzleCompletions["ship_fuel"] || 0],
    ["3+ puzzels opgelost", sessions.filter(d => (d.events || []).filter(e => e.type === "puzzle_complete").length >= 3).length],
    ["Game voltooid", totalGameCompletes],
    ["Leaderboard ingevuld", leaderboardDocs.length],
    ["Mee voor prijzen", prizeDocs.length],
  ];
  const maxAll = funnelAllSteps[0][1];
  for (const [label, count] of funnelAllSteps) {
    console.log(`   ${pct(count, maxAll).padStart(5)}  ${fmt(count).padStart(6)}  ${label}`);
  }

  // --- Funnel (v2 only, includes game_start) ---
  if (v2Sessions.length > 0) {
    const v2GameStarts = v2Sessions.filter(d => (d.events || []).some(e => e.type === "game_start")).length;
    const v2ShipFuel = v2Sessions.filter(d => (d.events || []).some(e => e.type === "puzzle_complete" && (e.puzzleKey === "ship_fuel" || e.puzzle === "ShipFuelScene"))).length;
    const v2ThreePlus = v2Sessions.filter(d => (d.events || []).filter(e => e.type === "puzzle_complete").length >= 3).length;
    const v2Complete = v2Sessions.filter(d => (d.events || []).some(e => e.type === "game_complete")).length;
    const v2InfoTab = v2Sessions.filter(d => (d.events || []).some(e => e.type === "info_tab_open")).length;

    console.log("\n--- Funnel (alleen v2 sessies, sinds deploy) ---");
    const funnelV2Steps = [
      ["Pagina bezocht (sessies)", v2Sessions.length],
      ["Game gestart (klik Start/Hervat)", v2GameStarts],
      ["Info-tabs bekeken", v2InfoTab],
      ["ShipFuel opgelost", v2ShipFuel],
      ["3+ puzzels opgelost", v2ThreePlus],
      ["Game voltooid", v2Complete],
    ];
    const maxV2 = funnelV2Steps[0][1];
    for (const [label, count] of funnelV2Steps) {
      console.log(`   ${pct(count, maxV2).padStart(5)}  ${fmt(count).padStart(6)}  ${label}`);
    }
  }

  // --- Summary ---
  if (totalGameCompletes > 0) {
    console.log("\n--- Samenvatting ---");
    console.log(`   Van de ${fmt(totalGameCompletes)} die het spel uitspeelden:`);
    console.log(`   - ${fmt(leaderboardDocs.length)} (${pct(leaderboardDocs.length, totalGameCompletes)}) op het leaderboard`);
    console.log(`   - ${fmt(prizeDocs.length)} (${pct(prizeDocs.length, totalGameCompletes)}) mee voor de prijzen`);
  }

  console.log("\n" + "=".repeat(60));
}

main().catch((err) => {
  console.error("\nError:", err.stack || err.message);
  process.exit(1);
});

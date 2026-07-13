#!/usr/bin/env node

/**
 * Telemetry Stats Script
 *
 * Reads local NDJSON data (fetched by fetch-telemetry.mjs) and displays statistics.
 * Deduplicates by sessionId (takes the document with the most events per session).
 *
 * Usage: node scripts/telemetry-stats.mjs
 */

import path from "path";
import { aggregate, dayLabel } from "./lib/telemetry-aggregate.mjs";

const __dirname = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(__dirname, "data");
const START_DATE = "2026-02-02";

function fmt(n) {
  return n.toLocaleString("nl-NL");
}

function pct(n, total) {
  if (total === 0) return "0%";
  return ((n / total) * 100).toFixed(0) + "%";
}

async function main() {
  const a = await aggregate({ dataDir: DATA_DIR, startDate: START_DATE });

  console.log("=".repeat(60));
  console.log("TELEMETRY STATS");
  console.log("=".repeat(60));

  console.log(`\n(${fmt(a.rawCount)} documents → ${fmt(a.sessions.length)} unieke sessies na deduplicatie)`);

  // --- Overview ---
  console.log("\n--- Totaaloverzicht ---");
  console.log(`   Unieke sessies:   ${fmt(a.sessions.length)} (${fmt(a.v1Sessions.length)} v1 + ${fmt(a.v2Sessions.length)} v2)`);
  console.log(`   Unieke spelers:   ${fmt(a.playerIds.size)} (alleen v2 — v1 heeft geen playerId)`);
  console.log(`   Games gestart:    ${fmt(a.totals.gameStarts)}${Object.keys(a.gameStartModes).length ? ` (${Object.entries(a.gameStartModes).map(([k, v]) => `${v}x ${k}`).join(", ")})` : ""} (alleen v2)`);
  console.log(`   Puzzels gestart:  ${fmt(a.totals.puzzleStarts)}`);
  console.log(`   Puzzels voltooid: ${fmt(a.totals.puzzleCompletes)}`);
  console.log(`   Foute pogingen:   ${fmt(a.totals.attemptFails)} (alleen v2)`);
  console.log(`   Puzzels verlaten: ${fmt(a.totals.abandons)} (alleen v2)`);
  console.log(`   Spellen voltooid: ${fmt(a.totals.gameCompletes)}`);
  console.log(`   Errors gelogd:    ${fmt(a.errorDocs.length)}`);

  // --- Per puzzle ---
  console.log("\n--- Per puzzel: gestart / voltooid / verlaten / foute pogingen ---");
  const allPuzzleKeys = new Set([
    ...Object.keys(a.puzzleStarts),
    ...Object.keys(a.puzzleCompletions),
    ...Object.keys(a.puzzleAbandons),
  ]);
  for (const key of [...allPuzzleKeys].sort((x, y) => (a.puzzleStarts[y] || 0) - (a.puzzleStarts[x] || 0))) {
    const starts = a.puzzleStarts[key] || 0;
    const completions = a.puzzleCompletions[key] || 0;
    const abandons = a.puzzleAbandons[key] || 0;
    const fails = a.puzzleAttemptFails[key] || 0;
    const completePct = starts > 0 ? pct(completions, starts) : "-";
    const abandonPct = starts > 0 ? pct(abandons, starts) : "-";
    console.log(`   ${key.padEnd(28)} ${String(starts).padStart(5)} gestart  ${String(completions).padStart(5)} voltooid (${completePct})  ${String(abandons).padStart(4)} verlaten (${abandonPct})  ${String(fails).padStart(4)} fout`);
  }

  // --- Puzzle completions ---
  console.log("\n--- Puzzels opgelost ---");
  for (const [key, count] of Object.entries(a.puzzleCompletions).sort((x, y) => y[1] - x[1])) {
    console.log(`   ${fmt(count).padStart(6)}  ${key}`);
  }

  // --- Substeps ---
  if (Object.keys(a.substepCompletions).length) {
    console.log("\n--- Substeps voltooid ---");
    for (const [label, count] of Object.entries(a.substepCompletions).sort()) {
      console.log(`   ${label.padEnd(30)} ${fmt(count)}`);
    }
  }

  // --- Top wrong answers ---
  if (Object.keys(a.wrongAnswers).length) {
    console.log("\n--- Veelvoorkomende foute antwoorden (top 5 per puzzel) ---");
    for (const [puzzle, answers] of Object.entries(a.wrongAnswers).sort()) {
      const sorted = Object.entries(answers).sort((x, y) => y[1] - x[1]).slice(0, 5);
      if (sorted.length === 0) continue;
      console.log(`   ${puzzle}:`);
      for (const [answer, count] of sorted) {
        console.log(`      ${String(count).padStart(4)}x  "${answer}"`);
      }
    }
  }

  // --- Info tabs & links ---
  if (Object.keys(a.infoTabs).length) {
    console.log("\n--- Info-tabs geopend ---");
    for (const [tab, count] of Object.entries(a.infoTabs).sort((x, y) => y[1] - x[1])) {
      console.log(`   ${fmt(count).padStart(6)}  ${tab}`);
    }
  }
  if (Object.keys(a.linkClicks).length) {
    console.log("\n--- Externe links geklikt ---");
    for (const [url, count] of Object.entries(a.linkClicks).sort((x, y) => y[1] - x[1])) {
      console.log(`   ${fmt(count).padStart(6)}  ${url}`);
    }
  }

  // --- Sessions per day ---
  console.log("\n--- Sessies per dag ---");
  for (const day of a.allDays) {
    console.log(`   ${dayLabel(day)}: ${fmt(a.sessionsByDay[day] || 0)}`);
  }

  // --- Leaderboard ---
  console.log("\n--- Leaderboard ---");
  console.log(`   Totaal: ${fmt(a.leaderboardDocs.length)}`);
  for (const day of a.allDays) {
    console.log(`   ${dayLabel(day)}: ${fmt(a.leaderboardByDay[day] || 0)}`);
  }

  // --- Prizes ---
  console.log("\n--- Prijzen ---");
  console.log(`   Totaal: ${fmt(a.prizeDocs.length)}`);
  for (const day of a.allDays) {
    console.log(`   ${dayLabel(day)}: ${fmt(a.prizesByDay[day] || 0)}`);
  }
  if (Object.keys(a.campPref).length) {
    console.log(`   Kampvoorkeur: ${Object.entries(a.campPref).map(([k, v]) => `${v}x ${k}`).join(", ")}`);
  }
  if (Object.keys(a.groups).length) {
    console.log(`   Groepen: ${Object.entries(a.groups).sort((x, y) => y[0] - x[0]).map(([k, v]) => `${v}x gr.${k}`).join(", ")}`);
  }

  // --- Funnel (all-time, using events available in both v1 and v2) ---
  console.log("\n--- Funnel (alle sessies, v1+v2) ---");
  const maxAll = a.funnelAll[0][1];
  for (const [label, count] of a.funnelAll) {
    console.log(`   ${pct(count, maxAll).padStart(5)}  ${fmt(count).padStart(6)}  ${label}`);
  }

  // --- Funnel (v2 only, includes game_start) ---
  if (a.funnelV2) {
    console.log("\n--- Funnel (alleen v2 sessies, sinds deploy) ---");
    const maxV2 = a.funnelV2[0][1];
    for (const [label, count] of a.funnelV2) {
      console.log(`   ${pct(count, maxV2).padStart(5)}  ${fmt(count).padStart(6)}  ${label}`);
    }
  }

  // --- Summary ---
  if (a.totals.gameCompletes > 0) {
    console.log("\n--- Samenvatting ---");
    console.log(`   Van de ${fmt(a.totals.gameCompletes)} die het spel uitspeelden:`);
    console.log(`   - ${fmt(a.leaderboardDocs.length)} (${pct(a.leaderboardDocs.length, a.totals.gameCompletes)}) op het leaderboard`);
    console.log(`   - ${fmt(a.prizeDocs.length)} (${pct(a.prizeDocs.length, a.totals.gameCompletes)}) mee voor de prijzen`);
  }

  console.log("\n" + "=".repeat(60));
}

main().catch((err) => {
  console.error("\nError:", err.stack || err.message);
  process.exit(1);
});

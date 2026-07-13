/**
 * Shared telemetry aggregation.
 *
 * Reads the local NDJSON cache (produced by fetch-telemetry.mjs), deduplicates
 * analytics docs by sessionId (keeping the doc with the most events per session),
 * and produces a single object with all numbers needed for both the text-stats
 * report and the HTML/charts report.
 */

import fs from "fs";
import path from "path";
import { scanNdjson, readNdjsonAll } from "./ndjson.mjs";

export const DAY_NAMES = ["zo", "ma", "di", "wo", "do", "vr", "za"];

// Map scene keys to canonical puzzle names for consistent reporting
export const SCENE_TO_PUZZLE = {
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

export function canonicalPuzzle(sceneKey) {
  return SCENE_TO_PUZZLE[sceneKey] || sceneKey;
}

export function allDaysSince(startDate) {
  const days = [];
  const now = new Date();
  const cur = new Date(startDate + "T00:00:00");
  while (cur <= now) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function dayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${dateStr} (${DAY_NAMES[d.getDay()]})`;
}

async function readCollection(dataDir, name) {
  const filePath = path.join(dataDir, `${name}.ndjson`);
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
async function streamAndDedupSessions(dataDir) {
  const filePath = path.join(dataDir, "telemetry-analytics.ndjson");
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

/**
 * Aggregate all telemetry into the shape used by both text-stats and the
 * charts report. Pass the data directory and a startDate (YYYY-MM-DD) used
 * for the "all days" calendar of per-day series.
 */
export async function aggregate({ dataDir, startDate }) {
  const { sessions, rawCount } = await streamAndDedupSessions(dataDir);
  const leaderboardDocs = await readCollection(dataDir, "leaderbord-kamp-a");
  const prizeDocs = await readCollection(dataDir, "prizes-kamp-a");
  const errorDocs = await readCollection(dataDir, "telemetry-errors");

  let totalPuzzleStarts = 0;
  let totalPuzzleCompletes = 0;
  let totalGameCompletes = 0;
  let totalGameStarts = 0;
  let totalAttemptFails = 0;
  let totalAbandons = 0;
  const sessionsByDay = {};
  const sessionsByDayV1 = {};
  const sessionsByDayV2 = {};
  const gameCompletesByDay = {};
  const puzzleCompletions = {};
  const puzzleStarts = {};
  const puzzleAbandons = {};
  const puzzleAttemptFails = {};
  const substepCompletions = {};
  const wrongAnswers = {};
  const playerIds = new Set();
  const infoTabs = {};
  const linkClicks = {};
  const gameStartModes = {};

  for (const doc of sessions) {
    const events = doc.events || [];
    const isV2 = !!doc.playerId;

    if (doc.playerId) playerIds.add(doc.playerId);

    if (doc.createdAt) {
      const day = new Date(doc.createdAt).toISOString().slice(0, 10);
      sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
      if (isV2) {
        sessionsByDayV2[day] = (sessionsByDayV2[day] || 0) + 1;
      } else {
        sessionsByDayV1[day] = (sessionsByDayV1[day] || 0) + 1;
      }
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
      if (evt.type === "game_complete") {
        totalGameCompletes++;
        const ts = evt.timestamp || doc.createdAt;
        if (ts) {
          const day = new Date(ts).toISOString().slice(0, 10);
          gameCompletesByDay[day] = (gameCompletesByDay[day] || 0) + 1;
        }
      }
      if (evt.type === "game_start") {
        totalGameStarts++;
        const mode = evt.mode || "unknown";
        gameStartModes[mode] = (gameStartModes[mode] || 0) + 1;
      }
      if (evt.type === "puzzle_attempt_fail") {
        totalAttemptFails++;
        const key = evt.puzzle || "unknown";
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

  const v2Sessions = sessions.filter(d => d.playerId);
  const v1Sessions = sessions.filter(d => !d.playerId);

  const leaderboardByDay = {};
  for (const doc of leaderboardDocs) {
    if (doc.createdAt) {
      const day = new Date(doc.createdAt).toISOString().slice(0, 10);
      leaderboardByDay[day] = (leaderboardByDay[day] || 0) + 1;
    }
  }

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

  const allDays = allDaysSince(startDate);

  // Funnels
  const threePlusSessions = sessions.filter(d => (d.events || []).filter(e => e.type === "puzzle_complete").length >= 3).length;
  const funnelAll = [
    ["Pagina bezocht (sessies)", sessions.length],
    ["ShipFuel opgelost", puzzleCompletions["ship_fuel"] || 0],
    ["3+ puzzels opgelost", threePlusSessions],
    ["Game voltooid", totalGameCompletes],
    ["Leaderboard ingevuld", leaderboardDocs.length],
    ["Mee voor prijzen", prizeDocs.length],
  ];

  let funnelV2 = null;
  if (v2Sessions.length > 0) {
    const v2GameStarts = v2Sessions.filter(d => (d.events || []).some(e => e.type === "game_start")).length;
    const v2ShipFuel = v2Sessions.filter(d => (d.events || []).some(e => e.type === "puzzle_complete" && (e.puzzleKey === "ship_fuel" || e.puzzle === "ShipFuelScene"))).length;
    const v2ThreePlus = v2Sessions.filter(d => (d.events || []).filter(e => e.type === "puzzle_complete").length >= 3).length;
    const v2Complete = v2Sessions.filter(d => (d.events || []).some(e => e.type === "game_complete")).length;
    const v2InfoTab = v2Sessions.filter(d => (d.events || []).some(e => e.type === "info_tab_open")).length;
    funnelV2 = [
      ["Pagina bezocht (sessies)", v2Sessions.length],
      ["Game gestart (klik Start/Hervat)", v2GameStarts],
      ["Info-tabs bekeken", v2InfoTab],
      ["ShipFuel opgelost", v2ShipFuel],
      ["3+ puzzels opgelost", v2ThreePlus],
      ["Game voltooid", v2Complete],
    ];
  }

  return {
    rawCount,
    sessions,
    v1Sessions,
    v2Sessions,
    playerIds,
    leaderboardDocs,
    prizeDocs,
    errorDocs,
    totals: {
      puzzleStarts: totalPuzzleStarts,
      puzzleCompletes: totalPuzzleCompletes,
      gameCompletes: totalGameCompletes,
      gameStarts: totalGameStarts,
      attemptFails: totalAttemptFails,
      abandons: totalAbandons,
    },
    puzzleStarts,
    puzzleCompletions,
    puzzleAbandons,
    puzzleAttemptFails,
    substepCompletions,
    wrongAnswers,
    infoTabs,
    linkClicks,
    gameStartModes,
    sessionsByDay,
    sessionsByDayV1,
    sessionsByDayV2,
    gameCompletesByDay,
    leaderboardByDay,
    prizesByDay,
    campPref,
    groups,
    allDays,
    funnelAll,
    funnelV2,
  };
}

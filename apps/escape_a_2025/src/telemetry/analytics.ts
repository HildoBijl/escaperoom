import Phaser from "phaser";
import { getDeviceInfo } from "./deviceInfo";
import { sessionId, playerId, getCurrentSceneKey } from "./session";
import { submitAnalytics } from "./telemetryFirestore";
import { PUZZLE_REWARDS, PuzzleKey } from "../scenes/face_scenes/_FaceConfig";

// Known puzzle scene keys (scenes where player is actively solving a puzzle)
const PUZZLE_SCENES = new Set([
  "ShipFuelScene",
  "LogicTower",
  "LogicTower_1",
  "LogicTower_2",
  "LogicTower_3",
  "LogicTower_4",
  "LogicTower_5",
  "SudokuScene",
  "PhoneBoxScene",
  "StreakMaze",
  "SlotScene",
  "DominoScene",
  "kvq_driehoeken",
  "kvq_som_1",
  "kvq_eieren",
  "kvq_oneven",
  "kvq_fruit",
  "kvq_vierkant",
  "kvq_antwoorden_invullen",
  "TangramKikkerScene",
  "TangramKrabScene",
  "TangramSchildpadScene",
  "TangramSelectScene",
]);

const FACE_SCENES = new Set([
  "Face1Scene",
  "Face2Scene",
  "Face3Scene",
  "Face4Scene",
  "Face5Scene",
  "Face6Scene",
  "Face7Scene",
  "Face8Scene",
  "Face9Scene",
  "Face10Scene",
  "Face11Scene",
  "Face12Scene",
]);

// Substep registry keys: tower floors + tangram animals
const SUBSTEP_KEYS = new Map<string, { puzzle: string; substep: string }>([
  ["logic_tower_0_solved", { puzzle: "LogicTower", substep: "floor_0" }],
  ["logic_tower_1_solved", { puzzle: "LogicTower", substep: "floor_1" }],
  ["logic_tower_2_solved", { puzzle: "LogicTower", substep: "floor_2" }],
  ["logic_tower_3_solved", { puzzle: "LogicTower", substep: "floor_3" }],
  ["logic_tower_4_solved", { puzzle: "LogicTower", substep: "floor_4" }],
  ["tower_solved", { puzzle: "LogicTower", substep: "floor_5" }],
  ["tangram_kikker_solved", { puzzle: "Tangram", substep: "kikker" }],
  ["tangram_schildpad_solved", { puzzle: "Tangram", substep: "schildpad" }],
  ["tangram_krab_solved", { puzzle: "Tangram", substep: "krab" }],
]);

// Build a set of all solved-registry-keys from PUZZLE_REWARDS
const SOLVED_KEYS = new Map<string, PuzzleKey>();
for (const [key, config] of Object.entries(PUZZLE_REWARDS)) {
  SOLVED_KEYS.set(config.puzzleSolvedRegistryKey, key as PuzzleKey);
}

type AnalyticsEvent = Record<string, unknown>;

let events: AnalyticsEvent[] = [];
let lastFlushedCount = 0;
let lastScene = "";

// Puzzle timing state
let puzzleStartTime = 0;
let puzzleAccumulatedMs = 0;
let puzzlePaused = false;
let currentPuzzleScene = "";
let puzzleJustCompleted = false;

// Attempt tracking
let attemptCounter = 0;
let lastPuzzleSnapshot: Record<string, unknown> | null = null;

// Session active time tracking
let sessionStartTime = 0;
let sessionAccumulatedMs = 0;
let sessionPaused = false;

// Session end debounce
let sessionEndTimer: ReturnType<typeof setTimeout> | null = null;

// localStorage key for recovered sessions
const PENDING_KEY = "escaperoom_pending_telemetry";

/** Push an event into the buffer (exported for rageClickDetector). */
export function pushEvent(event: AnalyticsEvent): void {
  events.push(event);
}

export function initAnalytics(game: Phaser.Game): void {
  // Recover pending events from a previous session that didn't flush
  try {
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) {
      localStorage.removeItem(PENDING_KEY);
      const data = JSON.parse(pending);
      if (data && Array.isArray(data.events) && data.events.length > 0) {
        submitAnalytics(data).catch(() => {});
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Snapshot of already-solved keys (from BootScene save restore)
  const alreadySolved = new Set<string>();
  for (const config of Object.values(PUZZLE_REWARDS)) {
    if (game.registry.get(config.puzzleSolvedRegistryKey) === true) {
      alreadySolved.add(config.puzzleSolvedRegistryKey);
    }
  }
  // Also snapshot substep keys
  const alreadySolvedSubsteps = new Set<string>();
  for (const key of SUBSTEP_KEYS.keys()) {
    if (game.registry.get(key) === true) {
      alreadySolvedSubsteps.add(key);
    }
  }

  // Session timing
  sessionStartTime = Date.now();
  sessionAccumulatedMs = 0;
  sessionPaused = false;

  // Record session start
  events.push({ type: "session_start", timestamp: Date.now() });

  // Scene change detection (500ms interval)
  setInterval(() => {
    const current = getCurrentSceneKey();
    if (current === lastScene) return;

    const prev = lastScene;
    lastScene = current;

    // Detect puzzle abandon: leaving a puzzle scene without completing it
    if (PUZZLE_SCENES.has(prev) && !PUZZLE_SCENES.has(current)) {
      if (!puzzleJustCompleted) {
        const duration =
          puzzleAccumulatedMs +
          (puzzlePaused ? 0 : Date.now() - puzzleStartTime);
        const abandonEvent: AnalyticsEvent = {
          type: "puzzle_abandon",
          puzzle: prev,
          timeSpentMs: puzzleStartTime > 0 ? duration : 0,
          failedAttempts: attemptCounter,
          timestamp: Date.now(),
        };
        if (lastPuzzleSnapshot) {
          abandonEvent.snapshot = lastPuzzleSnapshot;
        }
        events.push(abandonEvent);
      }
      puzzleJustCompleted = false;
    }

    // Detect puzzle start
    if (PUZZLE_SCENES.has(current) && !PUZZLE_SCENES.has(prev)) {
      currentPuzzleScene = current;
      puzzleStartTime = Date.now();
      puzzleAccumulatedMs = 0;
      puzzlePaused = false;
      puzzleJustCompleted = false;
      attemptCounter = 0;
      lastPuzzleSnapshot = null;
      events.push({
        type: "puzzle_start",
        puzzle: current,
        timestamp: Date.now(),
      });
    }

    // Detect face visit
    if (FACE_SCENES.has(current)) {
      events.push({
        type: "face_visit",
        faceId: current,
        fromFace: prev,
        timestamp: Date.now(),
      });
    }

    // Detect game complete
    if (current === "EndCreditsScene" && prev !== "EndCreditsScene") {
      const puzzlesSolved: string[] = [];
      for (const [key, config] of Object.entries(PUZZLE_REWARDS)) {
        if (game.registry.get(config.puzzleSolvedRegistryKey) === true) {
          puzzlesSolved.push(key);
        }
      }
      events.push({
        type: "game_complete",
        puzzlesSolved,
        energy: game.registry.get("energy") ?? 0,
        timestamp: Date.now(),
      });
      flush();
    }
  }, 500);

  // Puzzle completion via registry events
  const onSolvedChange = (
    _parent: unknown,
    key: string,
    value: unknown,
  ) => {
    if (value !== true) return;

    // Substep tracking (tower floors, tangram animals)
    if (SUBSTEP_KEYS.has(key) && !alreadySolvedSubsteps.has(key)) {
      alreadySolvedSubsteps.add(key);
      const info = SUBSTEP_KEYS.get(key)!;
      events.push({
        type: "substep_complete",
        puzzle: info.puzzle,
        substep: info.substep,
        timestamp: Date.now(),
      });
    }

    // Main puzzle completion
    if (!SOLVED_KEYS.has(key)) return;
    if (alreadySolved.has(key)) return;

    alreadySolved.add(key);
    puzzleJustCompleted = true;

    const duration =
      puzzleAccumulatedMs +
      (puzzlePaused ? 0 : Date.now() - puzzleStartTime);

    const event: AnalyticsEvent = {
      type: "puzzle_complete",
      puzzle: currentPuzzleScene || getCurrentSceneKey(),
      registryKey: key,
      puzzleKey: SOLVED_KEYS.get(key),
      timestamp: Date.now(),
    };
    if (puzzleStartTime > 0) {
      event.approxDurationMs = duration;
    }
    events.push(event);

    flush();
  };

  game.registry.events.on("setdata", onSolvedChange);
  game.registry.events.on("changedata", onSolvedChange);

  // --- Phaser event listeners (from game scenes) ---

  game.events.on(
    "telemetry:attempt_fail",
    (puzzle: string, givenAnswer?: string, extra?: string) => {
      attemptCounter++;
      const event: AnalyticsEvent = {
        type: "puzzle_attempt_fail",
        puzzle,
        attemptNumber: attemptCounter,
        timestamp: Date.now(),
      };
      if (givenAnswer !== undefined) event.givenAnswer = givenAnswer;
      if (extra !== undefined) event.extra = extra;
      events.push(event);
    },
  );

  game.events.on("telemetry:substep", (puzzle: string, substepId: string) => {
    events.push({
      type: "substep_complete",
      puzzle,
      substep: substepId,
      timestamp: Date.now(),
    });
  });

  game.events.on(
    "telemetry:puzzle_snapshot",
    (data: Record<string, unknown>) => {
      lastPuzzleSnapshot = data;
    },
  );

  game.events.on("telemetry:info_tab", (tab: string) => {
    events.push({
      type: "info_tab_open",
      tab,
      timestamp: Date.now(),
    });
  });

  game.events.on("telemetry:link_click", (url: string) => {
    events.push({
      type: "external_link_click",
      url,
      timestamp: Date.now(),
    });
  });

  game.events.on("telemetry:game_start", (mode: string) => {
    events.push({
      type: "game_start",
      mode, // "new", "new_first", or "resume"
      timestamp: Date.now(),
    });
  });

  game.events.on("telemetry:new_game", (hadPreviousSave: boolean) => {
    events.push({
      type: "new_game_start",
      hadPreviousSave,
      timestamp: Date.now(),
    });
  });

  game.events.on(
    "telemetry:asset_load",
    (durationMs: number, connectionType: string) => {
      events.push({
        type: "asset_load_time",
        durationMs,
        connectionType,
        timestamp: Date.now(),
      });
    },
  );

  // --- Visibility change: pause/resume timing + session end ---
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      // Pause puzzle timer
      if (!puzzlePaused && puzzleStartTime > 0) {
        puzzleAccumulatedMs += Date.now() - puzzleStartTime;
        puzzlePaused = true;
      }
      // Pause session timer
      if (!sessionPaused) {
        sessionAccumulatedMs += Date.now() - sessionStartTime;
        sessionPaused = true;
      }

      // Start 5s debounce for session_end
      if (sessionEndTimer === null) {
        sessionEndTimer = setTimeout(() => {
          logSessionEnd(game);
          flush();
        }, 5000);
      }

      flush();
    } else {
      // Cancel session end timer
      if (sessionEndTimer !== null) {
        clearTimeout(sessionEndTimer);
        sessionEndTimer = null;
      }
      // Resume puzzle timer
      if (puzzlePaused) {
        puzzleStartTime = Date.now();
        puzzlePaused = false;
      }
      // Resume session timer
      if (sessionPaused) {
        sessionStartTime = Date.now();
        sessionPaused = false;
      }
    }
  });

  // Flush on page unload (backup for mobile)
  window.addEventListener("beforeunload", () => {
    logSessionEnd(game);
    flush();
  });
}

function logSessionEnd(game: Phaser.Game): void {
  const totalActiveTimeMs =
    sessionAccumulatedMs +
    (sessionPaused ? 0 : Date.now() - sessionStartTime);

  let puzzlesSolved = 0;
  for (const config of Object.values(PUZZLE_REWARDS)) {
    if (game.registry.get(config.puzzleSolvedRegistryKey) === true) {
      puzzlesSolved++;
    }
  }

  events.push({
    type: "session_end",
    totalActiveTimeMs,
    lastScene: getCurrentSceneKey(),
    puzzlesSolved,
    timestamp: Date.now(),
  });
}

function flush(): void {
  if (events.length === lastFlushedCount) return; // nothing new
  lastFlushedCount = events.length;

  const data = {
    sessionId,
    playerId,
    deviceInfo: getDeviceInfo(),
    events: [...events],
  };

  // Buffer to localStorage for recovery if flush fails / tab closes
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — ignore
  }

  submitAnalytics(data)
    .then(() => {
      // Successful flush — clear pending buffer
      try {
        localStorage.removeItem(PENDING_KEY);
      } catch {
        // ignore
      }
    })
    .catch((err) => {
      console.error("[Telemetry] flush failed:", err);
    });
}

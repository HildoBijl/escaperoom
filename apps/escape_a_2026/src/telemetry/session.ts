import Phaser from "phaser";
import { checkAndReserveBudget } from "./telemetryFirestore";
import { initErrorLogger } from "./errorLogger";
import { initAnalytics } from "./analytics";
import { initRageClickDetector } from "./rageClickDetector";
import { BugReportButton } from "./bugReportButton";

// Session ID: unique per page load
export const sessionId: string =
  crypto.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// Player ID: persistent across sessions (survives tab close + browser restart)
const PLAYER_ID_KEY = "escaperoom_player_id";
export const playerId: string = (() => {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id =
      crypto.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
})();

let gameRef: Phaser.Game | null = null;

export function getCurrentSceneKey(): string {
  return gameRef?.scene.getScenes(true)[0]?.scene.key ?? "unknown";
}

/**
 * Main entry point for all telemetry.
 * Call once after Phaser game creation.
 */
export async function initTelemetry(game: Phaser.Game): Promise<void> {
  gameRef = game;

  // Bug report button always active (not gated by budget)
  new BugReportButton(game);

  // Check budget — this is async (Firestore read), which also ensures
  // BootScene has finished restoring saved state by the time we init analytics
  let budgetOk = false;
  try {
    budgetOk = await checkAndReserveBudget(10);
  } catch {
    // Firestore error — enable optimistically
    budgetOk = true;
  }

  if (budgetOk) {
    initErrorLogger();
    initAnalytics(game);
    initRageClickDetector(game);
  }
}

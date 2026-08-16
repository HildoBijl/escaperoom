import Phaser from "phaser";
import { getCurrentSceneKey } from "./session";
import { pushEvent } from "./analytics";

interface ClickRecord {
  x: number;
  y: number;
  time: number;
}

const WINDOW_MS = 1000;
const RADIUS_PX = 50;
const THRESHOLD = 5;
const MAX_EVENTS_PER_SESSION = 3;

let eventCount = 0;

export function initRageClickDetector(game: Phaser.Game): void {
  const clicks: ClickRecord[] = [];
  const canvas = game.canvas;

  canvas.addEventListener("pointerdown", (e: PointerEvent) => {
    if (eventCount >= MAX_EVENTS_PER_SESSION) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = Date.now();
    clicks.push({ x, y, time: now });

    // Prune old clicks outside the window
    while (clicks.length > 0 && now - clicks[0].time > WINDOW_MS) {
      clicks.shift();
    }

    if (clicks.length < THRESHOLD) return;

    // Check if enough clicks are within the radius of the latest click
    let nearby = 0;
    for (const click of clicks) {
      const dist = Phaser.Math.Distance.Between(x, y, click.x, click.y);
      if (dist <= RADIUS_PX) nearby++;
    }

    if (nearby >= THRESHOLD) {
      eventCount++;
      pushEvent({
        type: "rage_click",
        scene: getCurrentSceneKey(),
        x: Math.round(x),
        y: Math.round(y),
        clickCount: nearby,
        timestamp: now,
      });
      // Clear to avoid rapid re-triggering
      clicks.length = 0;
    }
  });
}

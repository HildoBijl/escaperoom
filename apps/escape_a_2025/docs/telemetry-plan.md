# Telemetry Plan: Bug Reports, Error Logging & Analytics

## Overzicht

Drie features die dezelfde basis delen (device info, session ID, Firestore writes):

1. **Bug report knop** — testers melden handmatig bugs, device info wordt automatisch bijgevoegd
2. **Error logging** — JS errors worden automatisch naar Firestore gestuurd
3. **Game analytics** — sessies, puzzle starts/completions en tijdsduur bijhouden

Alle telemetry is fire-and-forget — mag nooit het spel breken. Budget systeem beschermt de Firestore Spark-limiet (20k writes/dag) zodat prijsinzendingen altijd werken.

---

## Architectuur

### Nieuwe bestanden

```
src/telemetry/
  deviceInfo.ts          — device info verzamelen (browser, OS, mobiel/desktop, scherm)
  session.ts             — session ID, scene tracker, initTelemetry() entry point
  telemetryFirestore.ts  — Firestore write functies + budget counter
  errorLogger.ts         — window.onerror + unhandledrejection handlers
  analytics.ts           — puzzle timing + event tracking via registry events
  bugReportButton.ts     — DOM overlay knop + modal (zelfde patroon als DebugMenu)
```

### Bestaande bestanden die aangepast worden

- `src/main.ts` — `initTelemetry(game)` aanroepen na game creation
- `firestore.rules` — 4 nieuwe collectie-regels toevoegen

---

## Gedeelde basis

### deviceInfo.ts
Verzamelt eenmalig en cachet:
- `navigator.userAgent` (max 300 chars)
- `navigator.platform`
- `screen.width` / `screen.height`
- `isMobile` (via `pointer: coarse` media query of scherm < 768px)
- `navigator.language`

### session.ts
- Genereert random `sessionId` per page load via `crypto.randomUUID()` (met fallback)
- Houdt referentie naar `Phaser.Game` voor `getCurrentSceneKey()` (via `game.scene.getScenes(true)[0]`, zelfde patroon als DebugMenu)
- Exporteert `initTelemetry(game)` als enige entry point (zie Wijzigingen in main.ts)

### telemetryFirestore.ts
Async functies via `addDoc` op `db` (uit bestaande `firebase/firestore.ts`):
- `submitBugReport(data)` → collectie `telemetry-bug-reports`
- `submitError(data)` → collectie `telemetry-errors`
- `submitAnalytics(data)` → collectie `telemetry-analytics`
- `checkAndReserveBudget(estimatedWrites)` → leest/update `telemetry-meta/today`

### Budget systeem
Voorkomt dat telemetry de Spark-limiet (20k writes/dag) opeet ten koste van prijsinzendingen.

- Document `telemetry-meta/today` bevat `{ date: "2026-02-02", count: 1234 }`
- Bij sessie-start: lees dit document
  - Document bestaat niet (eerste keer ooit) → behandel als count=0
  - `date` is niet vandaag → reset naar `{ date: vandaag, count: 0 }`
  - `count >= 15.000` → disable error logging en analytics voor deze sessie
  - Anders → increment `count` met geschat aantal writes (~10) via `FieldValue.increment()`
- Kost 1 read + 1 write per sessie
- **Bug reports schrijven altijd**, ongeacht budget
- Bij budget overschrijding: alleen error logging en analytics worden uitgeschakeld
- Marge: 5.000 writes/dag gereserveerd voor prijsinzendingen en leaderboard
- Bij read-fout (Firestore down): telemetry optimistisch inschakelen

---

## Feature 1: Bug Report Knop

### bugReportButton.ts
DOM overlay, zelfde patroon als `src/ui/DebugMenu.ts`:
- Kleine ronde knop links-onder (`position: fixed; bottom: 12px; left: 12px`)
- Tekst: "Bug melden" (tooltip), icoon: kever-emoji
- Klik opent modal met:
  - Textarea ("Beschrijf de bug..."), max 2000 chars
  - "Verstuur" en "Annuleer" knoppen
- Bij submit wordt automatisch bijgevoegd:
  - `deviceInfo`, `currentScene`, `sessionId`
  - `registrySnapshot` (energy + alle `_solved` keys uit `PUZZLE_REWARDS`)
  - `createdAt` timestamp
- Na submit: kort "Bedankt!" bericht, modal sluit
- **Rate limit:** max 5 bug reports per sessie
- **Phaser input:** keyboard input gepauzeerd terwijl modal open is (`game.input.keyboard.enabled = false`), hersteld bij sluiten
- Altijd zichtbaar, niet achter `DEBUG` flag

---

## Feature 2: Error Logging

### errorLogger.ts
- `window.addEventListener("error", ...)` en `window.addEventListener("unhandledrejection", ...)`
- Per error wordt opgeslagen:
  - `message` (max 500 chars), `stack` (max 2000 chars)
  - `type` ("error" | "unhandledrejection")
  - `currentScene`, `sessionId`, `deviceInfo`, `url`
  - `createdAt` timestamp
- **Rate limit:** max 10 errors per sessie (voorkomt infinite loop → infinite writes)
- Writes zijn fire-and-forget

---

## Feature 3: Game Analytics

### analytics.ts
Houdt events bij in een array in memory. Flusht naar Firestore bij belangrijke momenten. Elk flush-document bevat alle events tot dan toe — het laatste document per `sessionId` is het meest compleet.

**Events:**
| Event | Trigger | Extra data |
|---|---|---|
| `session_start` | Bij init | — |
| `puzzle_start` | Scene wisselt naar puzzle scene | `puzzle` (scene key) |
| `puzzle_complete` | Registry `_solved` key wordt `true` | `puzzle`, `approxDurationMs`, `registryKey` |
| `game_complete` | Scene wisselt naar EndCreditsScene | `puzzlesSolved[]`, `energy` |

Elk document bevat ook `sessionId`, `deviceInfo` en `createdAt`.

**Flush momenten:**
1. Bij elke `puzzle_complete` — belangrijkste datapunten, minimaliseert dataverlies
2. Bij `game_complete` — finale snapshot
3. Bij `document.visibilitychange` → hidden — tab weg / telefoon lock
4. Bij `window.beforeunload` — tab sluiten (backup, onbetrouwbaar op mobiel)

Geen flush bij `puzzle_start` of `session_start` — meegenomen in eerstvolgende flush.

**Flush deduplicatie:** Niet flushen als er geen nieuwe events zijn sinds de laatste flush. Voorkomt lege writes bij snel alt-tabben.

**Puzzle detectie:**
- Set van bekende puzzle scene keys (uit DebugMenu's SCENES config)
- Scene-wisselingen: 500ms interval op `getCurrentSceneKey()`
- Puzzle completions: `game.registry.events.on("setdata")` EN `on("changedata")` op `puzzleSolvedRegistryKey`s uit `PUZZLE_REWARDS`. Beide events nodig: `setdata` vuurt bij nieuw spel (key bestaat nog niet), `changedata` bij hervat spel (key was als `false` geladen door BootScene).

**Hervat spel (resumed sessions):**
- BootScene laadt opgeslagen `_solved: true` keys → vuurt `setdata` events
- Zonder bescherming zou analytics phantom `puzzle_complete` events loggen
- **Oplossing:** Bij analytics init, snapshot van alle `_solved` keys die al `true` zijn. Event handler negeert keys die in de snapshot staan.
- De async budget check (Firestore read) zorgt dat analytics init na BootScene's save restore draait. De snapshot is extra beveiliging.

**Puzzle timing:**
- Bij `puzzle_start`: `startTime = Date.now()`
- Bij `visibilitychange` → hidden: accumuleer verstreken tijd, pauzeer
- Bij `visibilitychange` → visible: hervat timer
- Bij `puzzle_complete`: bereken `approxDurationMs` (bewust "approx" — benadering)

**Write volume:** ~8-10 writes per sessie. Met budget systeem: ~1.500 sessies/dag binnen 15k telemetry limiet.

---

## Firestore Security Rules

```
telemetry-bug-reports:  create only, velden gevalideerd
telemetry-errors:       create only, velden gevalideerd
telemetry-analytics:    create only, velden gevalideerd
telemetry-meta/today:   read + create + update (budget counter)
```

Lichtere validatie dan PII-collecties — alleen type checks en max lengtes.

---

## Wijzigingen in main.ts

Na de bestaande `DebugMenu` initialisatie:

```typescript
import { initTelemetry } from "./telemetry/session";
initTelemetry(game);
```

`initTelemetry(game)` doet:
1. Genereer sessionId
2. Start bug report knop (altijd, ongeacht budget)
3. `await checkAndReserveBudget(10)`
4. Budget ok → start error logger en analytics
5. Budget op → error logger en analytics niet gestart

Niet achter `DEBUG` flag — telemetry draait altijd.

---

## Data uitlezen

Collecties zijn write-only vanuit de client. Lezen kan via:
- Firebase Console (handmatig)
- Firestore REST API (Claude kan aanroepen en samenvatten)
- `firebase` CLI

---

## Verificatie

1. `npm run build` — compileert zonder errors
2. Browser → bug report knop zichtbaar links-onder
3. Bug melden → verstuur → check Firebase Console `telemetry-bug-reports`
4. Console: `throw new Error("test")` → check `telemetry-errors`
5. Puzzel spelen → check `telemetry-analytics` voor events
6. Hervat spel → check dat al opgeloste puzzels NIET als nieuwe events verschijnen
7. `firebase deploy --only firestore:rules`

---

## AVG / Privacy

- Geen persoonsgegevens (alleen technische device info)
- Geen cookies nodig
- Rechtsgrond: gerechtvaardigd belang (foutopsporing)
- Vermeld in privacybeleid dat technische gegevens worden gelogd
- Verwijder telemetry-collecties wanneer niet meer nodig

---
---

# Telemetry v2: Uitgebreide Analytics

## Doelen

1. **Vastlopen detecteren** — spelers moeten nadenken en zoeken, maar niet vruchteloos blijven hangen
2. **Bereik meten** — hoeveel unieke spelers, hoeveel sessies per speler, terugkeergedrag
3. **Vierkant-bekendheid** — kijken spelers naar info over Vierkant voor Wiskunde?
4. **Oplossingspercentage** — hoeveel % lost de game op in 1 vs meerdere sessies?

---

## Nieuwe events

### Overzicht

| Event | Trigger | Extra data | Doel |
|---|---|---|---|
| `puzzle_abandon` | Speler verlaat puzzle zonder op te lossen (back/ESC) | `puzzle`, `timeSpentMs` | Vastlopen |
| `puzzle_attempt_fail` | Fout antwoord bij een puzzle | `puzzle`, `attemptNumber` | Vastlopen |
| `face_visit` | Speler betreedt een planeetvlak | `faceId`, `fromFace` | Navigatie |
| `info_tab_open` | Tab geopend in TitleScene popup | `tab` | Vierkant |
| `external_link_click` | Klik op externe link in info-popup | `url` | Vierkant |
| `new_game_start` | "Nieuw spel starten" geklikt (reset) | `hadPreviousSave` | Oplossings% |
| `session_end` | Tab sluit / visibility hidden (definitief) | `totalActiveTimeMs`, `lastScene` | Bereik |
| `asset_load_time` | PreloadScene klaar met laden | `durationMs`, `connectionType` | Performance |
| `rage_click` | 5+ clicks binnen 1s op zelfde plek | `scene`, `x`, `y` | UX/frustratie |

### Details per event

#### `puzzle_abandon`
**Trigger:** Scene wisselt weg van een puzzle scene ZONDER dat `_solved` is gezet. De bestaande scene-polling (500ms interval) detecteert al scene-wisselingen — als `lastScene` een puzzle was en `currentScene` dat niet meer is, en er geen `puzzle_complete` tussen zit → abandon.

**Payload:**
```typescript
{
  type: "puzzle_abandon",
  puzzle: string,        // scene key (bijv. "SudokuScene")
  timeSpentMs: number,   // zelfde timing-logica als puzzle_complete
  failedAttempts: number, // aantal foute pogingen voor vertrek (0 = nooit geprobeerd)
  snapshot?: object,     // optionele puzzle-specifieke state (zie onder)
  timestamp: number
}
```

**Snapshot per puzzle (optioneel, via Phaser event):**

| Puzzle | Snapshot | Voorbeeld | Inzicht |
|--------|----------|-----------|---------|
| **KVQ antwoorden** | Huidige slotwaarden | `{ slots: ["7","25","6","14","",""] }` | Welke antwoorden fout, welke leeg |
| **SudokuScene** | Aantal ingevulde cellen | `{ filledCells: 34 }` | Hoe ver waren ze met de sudoku |
| **Tangram** | Welke dieren al opgelost | `{ solved: ["kikker"] }` | Welk dier was het probleem |
| **DominoScene** | Aantal regels voldaan | `{ rulesPassed: 3, totalRules: 6 }` | Hoe ver waren ze |
| **StreakMaze** | Laatst bereikte stage | `{ lastStage: "stage3" }` | Waar gingen ze fout |
| **LogicTower** | Huidige verdieping | `{ currentFloor: 2 }` | Op welke verdieping vastgelopen |
| Overige | Geen snapshot | — | Alleen `timeSpentMs` + `failedAttempts` |

**Implementatie snapshots:** Puzzles die een snapshot willen sturen doen:
```typescript
this.game.events.emit("telemetry:puzzle_snapshot", { slots: [...] });
```
Analytics slaat de laatst ontvangen snapshot op en voegt het toe bij een eventuele abandon. Puzzles die het niet implementeren krijgen gewoon een abandon met alleen timing en attempts.

**Implementatie abandon-detectie:** In `analytics.ts`, in de bestaande scene-change detector. Als `PUZZLE_SCENES.has(prev) && !PUZZLE_SCENES.has(current)` en de puzzle niet net als complete is gelogd → log abandon.

#### `puzzle_attempt_fail`
**Trigger:** Speler geeft een fout antwoord bij een puzzle met expliciete check.

**Payload:**
```typescript
{
  type: "puzzle_attempt_fail",
  puzzle: string,          // scene key
  attemptNumber: number,   // bijgehouden per puzzle-sessie, reset bij puzzle_start
  givenAnswer?: string,    // het foute antwoord (niet bij ShipFuel)
  timestamp: number
}
```

**Per puzzle — wat we loggen:**

| Puzzle | Check-functie | `givenAnswer` voorbeeld | Aanpassing |
|--------|-------------|------------------------|-----------|
| **LogicTower** (floor 0) | `validateAnswer()` | `"maan"` (correct: "sterren") | +1 regel in `validateAnswer()` |
| **LogicTower_1** | `validateAnswer()` | `"e"` (correct: "r") | +1 regel |
| **LogicTower_2** | `checkSolution()` | `"3,7"` (correct: "7,5") | +1 regel |
| **LogicTower_3** | `checkAnswer()` | `"30"` (correct: "40") | +1 regel |
| **LogicTower_4** | `checkAnswer()` | `"vierkant"` (correct: "vierkantvoorwiskunde") | +1 regel |
| **LogicTower_5** | `checkAnswer()` | `"morse"` (correct: "einde") | +1 regel |
| **SlotScene** | `checkCode()` | `"3,5,2"` (3 cijfers) | +1 regel |
| **SudokuScene** | `checkCode()` | `"8,8,9,3"` (4 cijfers) | +1 regel |
| **PhoneBoxScene** | `checkCode()` | `"6291"` (4 cijfers) | +1 regel |
| **StreakMaze** | `enterRoom()` naar WrongRoom | `"9"` + `stage: "stage1"` | +1 regel bij foute keuze |
| **ShipFuelScene** | `triggerShortCircuit()` | _(niet gelogd, geen zinvolle waarde)_ | +1 regel |

**Niet van toepassing op:** Tangram, Domino, KVQ antwoorden (geen discreet check-moment).

**Implementatie:** Via Phaser event `game.events.emit("telemetry:attempt_fail", sceneKey, givenAnswer)`. Analytics luistert hierop. Puzzles hoeven analytics niet te importeren.

**StreakMaze specifiek:** Bij foute keuze weten we ook de stage (`stage1` t/m `stage5`). Emit: `game.events.emit("telemetry:attempt_fail", "StreakMaze", chosenLabel, stageId)`. Zo zien we of kinderen bij stage 2 (Fibonacci) massaal "6" kiezen ipv "8".

#### `substep_complete`
**Trigger:** Speler voltooit een deelopdracht binnen een multi-stap puzzle.

**Payload:**
```typescript
{
  type: "substep_complete",
  puzzle: string,         // hoofd-puzzle ("LogicTower" of "Tangram")
  substep: string,        // sub-identifier
  timestamp: number
}
```

**Van toepassing op:**

| Puzzle | Substeps | Registry keys |
|--------|----------|---------------|
| **LogicTower** | `floor_0` t/m `floor_5` (6 verdiepingen) | `logic_tower_0_solved` t/m `logic_tower_4_solved`, `tower_solved` |
| **Tangram** | `kikker`, `schildpad`, `krab` (3 dieren) | `tangram_kikker_solved`, `tangram_schildpad_solved`, `tangram_krab_solved` |
| **StreakMaze** | `stage1` t/m `stage5` (5 reeksen) | _(geen aparte registry keys)_ |

**Implementatie LogicTower:** Elke LogicTower scene zet al een eigen `_solved` registry key. Analytics luistert op deze keys (zoals bij `puzzle_complete`) en logt `substep_complete` events. Geen code-aanpassingen in puzzle-scenes nodig.

**Implementatie Tangram:** Zelfde patroon — analytics luistert op `tangram_kikker_solved` etc.

**Implementatie StreakMaze:** StreakMaze heeft geen registry keys per stage. Emit bij elke `enterRoom()` naar een volgende stage: `game.events.emit("telemetry:substep", "StreakMaze", stageId)`. +1 regel per stage-transitie, of 1 regel in `enterRoom()`.

**Analyse:** Als 80% van de kinderen floor 0-3 haalt maar slechts 40% floor 4 → floor 4 is te moeilijk. Als bij Tangram iedereen de kikker haalt maar niet de krab → krab is het probleem.

#### `face_visit`
**Trigger:** Scene wisselt naar een Face scene (Face1Scene t/m Face12Scene).

**Payload:**
```typescript
{
  type: "face_visit",
  faceId: string,        // "Face3Scene"
  fromFace: string,      // vorige face, of "CockpitScene" etc.
  timestamp: number
}
```

**Implementatie:** In de bestaande scene-change detector. Set van `FACE_SCENES` toevoegen (Face1Scene t/m Face12Scene). Als `current` een face is → log visit.

#### `info_tab_open`
**Trigger:** Speler klikt op een tab in de TitleScene info-popup.

**Payload:**
```typescript
{
  type: "info_tab_open",
  tab: string,           // "Info" | "Achtergrond" | "Contact"
  timestamp: number
}
```

**Implementatie:** In `TitleScene.switchPopupTab()`, een `game.events.emit("telemetry:info_tab", tabName)`. Analytics luistert hierop. Ook loggen wanneer de popup initieel geopend wordt (tab 0 = "Info").

#### `external_link_click`
**Trigger:** Speler klikt op een markdown-link in de info-popup die `window.open()` aanroept.

**Payload:**
```typescript
{
  type: "external_link_click",
  url: string,           // "https://www.vierkantvoorwiskunde.nl/kampen/"
  timestamp: number
}
```

**Implementatie:** In `TitleScene.buildRichTextIntoContainer()`, bij de `pointerdown` handler die `window.open(url)` doet, een `game.events.emit("telemetry:link_click", url)` toevoegen.

#### `new_game_start`
**Trigger:** Speler klikt "Nieuw spel starten" in TitleScene.

**Payload:**
```typescript
{
  type: "new_game_start",
  hadPreviousSave: boolean,  // was er al een opgeslagen spel?
  timestamp: number
}
```

**Implementatie:** In `TitleScene.handleStartClick()`, bij `clearSave = true`. Emit `game.events.emit("telemetry:new_game", hadSave)`.

#### `session_end`
**Trigger:** `visibilitychange` → hidden met 5s debounce (om snel alt-tabben te negeren), of `beforeunload`.

**Payload:**
```typescript
{
  type: "session_end",
  totalActiveTimeMs: number,  // totale actieve tijd (pauzes uitgesloten)
  lastScene: string,
  puzzlesSolved: number,      // aantal opgeloste puzzels
  timestamp: number
}
```

**Implementatie:** Nieuwe timer in analytics.ts die actieve tijd bijhoudt (gepauzeerd bij visibility hidden, hervat bij visible). Bij definitief verlaten → log event + flush.

#### `asset_load_time`
**Trigger:** PreloadScene `complete` event.

**Payload:**
```typescript
{
  type: "asset_load_time",
  durationMs: number,
  connectionType: string,    // navigator.connection?.effectiveType ?? "unknown"
  timestamp: number
}
```

**Implementatie:** In `PreloadScene.preload()`, `performance.now()` bij start. In `complete` callback, emit `game.events.emit("telemetry:asset_load", durationMs, connectionType)`.

#### `rage_click`
**Trigger:** 5+ pointer-down events binnen 1 seconde, binnen 50px radius.

**Payload:**
```typescript
{
  type: "rage_click",
  scene: string,
  x: number,
  y: number,
  clickCount: number,
  timestamp: number
}
```

**Implementatie:** Nieuwe module `telemetry/rageClickDetector.ts`. Luistert op `game.input.on("pointerdown")`. Houdt sliding window bij van recente clicks. Bij detectie → push event in analytics buffer. Rate limit: max 3 rage_click events per sessie.

---

## Persistent Player ID

### Doel
Sessies aan dezelfde speler koppelen. Beantwoordt: hoeveel unieke spelers, hoeveel sessies per speler, lost iemand het op in 1 of meerdere keren.

### Implementatie
In `session.ts`:

```typescript
const PLAYER_ID_KEY = "escaperoom_player_id";

export const playerId: string = (() => {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(PLAYER_ID_KEY);
  }
  return id;
})();
```

- Overleeft tab-sluitingen en browser-herstart
- Wordt NIET gereset bij "Nieuw spel starten" (zelfde persoon, nieuw spel)
- Wordt meegestuurd in elk analytics-document naast `sessionId`
- Wordt NIET meegestuurd in error logs of bug reports (niet nodig)

### DeviceInfo uitbreiding
`referrer` toevoegen aan deviceInfo:

```typescript
referrer: document.referrer.slice(0, 200)  // waar kwam de speler vandaan?
```

---

## Recovered Sessions (localStorage buffer)

### Probleem
`beforeunload` vuurt niet betrouwbaar op mobiele browsers (vooral iOS Safari). Data van de laatste minuten kan verloren gaan — precies het moment waarop iemand vastliep en stopte.

### Oplossing
Bij elke flush: sla events ook op in localStorage. Bij volgende sessie-start: check of er onverstuurde events zijn en stuur ze alsnog op.

```typescript
const PENDING_KEY = "escaperoom_pending_telemetry";

// Bij flush: ook naar localStorage schrijven
localStorage.setItem(PENDING_KEY, JSON.stringify({ sessionId, playerId, events }));

// Bij init: check op verloren data
const pending = localStorage.getItem(PENDING_KEY);
if (pending) {
  submitAnalytics(JSON.parse(pending)).catch(() => {});
  localStorage.removeItem(PENDING_KEY);
}
```

### Write volume impact
Geen extra Firestore writes — de localStorage write is gratis. De recovered flush is 1 extra write alleen als er daadwerkelijk verloren data was.

---

## Communicatiepatroon: Phaser Events

Om te voorkomen dat puzzle-scenes en TitleScene analytics.ts moeten importeren, gebruiken we Phaser's globale event bus:

```typescript
// Puzzle of UI scene (zender):
this.game.events.emit("telemetry:attempt_fail", this.scene.key);
this.game.events.emit("telemetry:info_tab", "Achtergrond");
this.game.events.emit("telemetry:link_click", url);
this.game.events.emit("telemetry:new_game", hadSave);
this.game.events.emit("telemetry:asset_load", durationMs, connectionType);

// analytics.ts (ontvanger):
game.events.on("telemetry:attempt_fail", (puzzle: string) => { ... });
game.events.on("telemetry:info_tab", (tab: string) => { ... });
// etc.
```

**Voordelen:**
- Puzzle-code hoeft niets te importeren uit telemetry/
- Als telemetry uit staat (budget op), luistert niemand → events verdwijnen gratis
- Makkelijk te testen: `game.events.emit(...)` in console

---

## Budget impact

| Event | Frequentie per sessie | Impact |
|---|---|---|
| `puzzle_abandon` | 0-5 | Geen (zit in bestaande flush) |
| `puzzle_attempt_fail` | 0-20 | Geen (zit in bestaande flush) |
| `face_visit` | 5-30 | Geen (zit in bestaande flush) |
| `info_tab_open` | 0-3 | Geen (zit in bestaande flush) |
| `external_link_click` | 0-2 | Geen (zit in bestaande flush) |
| `new_game_start` | 0-1 | Geen (zit in bestaande flush) |
| `session_end` | 1 | Geen (vervangt bestaande visibility flush) |
| `asset_load_time` | 1 | Geen (zit in eerste flush) |
| `rage_click` | 0-3 | Geen (zit in bestaande flush) |
| `recovered_session` | 0-1 | +1 write (alleen bij recovery) |

**Totaal:** Alle nieuwe events zitten in de bestaande event-array die geflushed wordt op dezelfde momenten. Geen extra Firestore writes nodig. Budget impact: **~0 extra writes per sessie**. De estimated writes per sessie kan op 10 blijven.

---

## Implementatieplan

### Stap 1: Persistent Player ID + DeviceInfo uitbreiding
**Bestanden:** `session.ts`, `deviceInfo.ts`, `telemetryFirestore.ts`
- `playerId` in localStorage + export uit `session.ts`
- `referrer` toevoegen aan `DeviceInfo` interface + `getDeviceInfo()`
- `playerId` meesturen in `submitAnalytics()` payload (naast `sessionId`)

### Stap 2: Nieuwe events + substeps in analytics.ts
**Bestand:** `analytics.ts`

Toevoegingen aan de scene-change detector (bestaande `setInterval`):
- `puzzle_abandon` — als `PUZZLE_SCENES.has(prev) && !PUZZLE_SCENES.has(current)` zonder tussentijdse `puzzle_complete`
- `face_visit` — als `FACE_SCENES.has(current)`. Nieuwe set: `Face1Scene` t/m `Face12Scene`

Nieuwe state:
- `attemptCounter: number` — reset bij `puzzle_start`, increment bij `telemetry:attempt_fail`
- `lastPuzzleSnapshot: object | null` — gezet via `telemetry:puzzle_snapshot`, gecleared bij `puzzle_start`
- `sessionActiveTimeMs: number` — bijgehouden via visibility events

Nieuwe substep-detectie:
- Luisteren op registry keys voor LogicTower floors (`logic_tower_0_solved` t/m `logic_tower_4_solved`, `tower_solved`) en Tangram dieren (`tangram_kikker_solved`, `tangram_schildpad_solved`, `tangram_krab_solved`)
- Dezelfde `alreadySolved`-bescherming als bij `puzzle_complete`

Phaser event listeners:
- `telemetry:attempt_fail` → `(puzzle, givenAnswer?, extra?)` → push `puzzle_attempt_fail`
- `telemetry:substep` → `(puzzle, substepId)` → push `substep_complete`
- `telemetry:puzzle_snapshot` → `(data)` → opslaan als `lastPuzzleSnapshot`
- `telemetry:info_tab` → `(tabName)` → push `info_tab_open`
- `telemetry:link_click` → `(url)` → push `external_link_click`
- `telemetry:new_game` → `(hadSave)` → push `new_game_start`
- `telemetry:asset_load` → `(durationMs, connectionType)` → push `asset_load_time`

Session end:
- `visibilitychange` → hidden: start 5s timer. Als na 5s nog hidden → log `session_end` + flush
- `visibilitychange` → visible: cancel timer
- `beforeunload`: direct `session_end` + flush

### Stap 3: Rage click detector
**Nieuw bestand:** `telemetry/rageClickDetector.ts`
- `initRageClickDetector(game, pushEvent)` — aangeroepen vanuit `session.ts`
- Luistert op `game.input.on("pointerdown")`
- Sliding window: array van `{ x, y, time }`, window = 1s, radius = 50px
- Bij 5+ matches → push `rage_click` event via callback
- Rate limit: max 3 events per sessie

### Stap 4: Recovered sessions
**Bestanden:** `analytics.ts`, `session.ts`
- Bij elke `flush()`: ook `localStorage.setItem(PENDING_KEY, JSON.stringify(...))`
- Bij `initAnalytics()`: check `localStorage.getItem(PENDING_KEY)`, submit als `recovered_session`, remove key
- `PENDING_KEY = "escaperoom_pending_telemetry"`

### Stap 5: Telemetry events emitten vanuit game-code
**Elke wijziging is 1-2 regels per bestand:**

**`scenes/TitleScene.ts`** (3 plekken):
- `switchPopupTab()` → `this.game.events.emit("telemetry:info_tab", tabs[nextIndex].title)`
- `openTabbedPopup()` → emit voor initiële tab ("Info")
- `buildRichTextIntoContainer()` bij `window.open(url)` → `this.game.events.emit("telemetry:link_click", url)`
- `handleStartClick()` bij `clearSave=true` → `this.game.events.emit("telemetry:new_game", true)`

**`scenes/PreloadScene.ts`** (2 plekken):
- `preload()` → `const loadStart = performance.now()`
- `complete` callback → `this.game.events.emit("telemetry:asset_load", performance.now() - loadStart, (navigator as any).connection?.effectiveType ?? "unknown")`

**Puzzles met `attempt_fail` (1 regel per puzzle):**
- `puzzles/LogicTower.ts` → in `validateAnswer()` else-branch: `this.game.events.emit("telemetry:attempt_fail", "LogicTower", value)`
- `puzzles/LogicTower_1.ts` → in `validateAnswer()` else-branch: `this.game.events.emit("telemetry:attempt_fail", "LogicTower_1", value)`
- `puzzles/LogicTower_2.ts` → in `checkSolution()` else-branch: `this.game.events.emit("telemetry:attempt_fail", "LogicTower_2", xVal+","+yVal)`
- `puzzles/LogicTower_3.ts` → in `checkAnswer()` else-branch: `this.game.events.emit("telemetry:attempt_fail", "LogicTower_3", val.toString())`
- `puzzles/LogicTower_4.ts` → in `checkAnswer()` else-branch: `this.game.events.emit("telemetry:attempt_fail", "LogicTower_4", rawValue)`
- `puzzles/LogicTower_5.ts` → in `checkAnswer()` else-branch: `this.game.events.emit("telemetry:attempt_fail", "LogicTower_5", val)`
- `puzzles/SlotScene.ts` → in `checkCode()` else-branch: `this.game.events.emit("telemetry:attempt_fail", "SlotScene", this.currentCode.join(","))`
- `puzzles/SudokuScene.ts` → in `checkCode()` else-branch: `this.game.events.emit("telemetry:attempt_fail", "SudokuScene", enteredCode.join(","))`
- `puzzles/PhoneBoxScene.ts` → in `checkCode()` else-branch: `this.game.events.emit("telemetry:attempt_fail", "PhoneBoxScene", this.enteredCode)`
- `puzzles/ShipFuelScene.ts` → in `triggerShortCircuit()`: `this.game.events.emit("telemetry:attempt_fail", "ShipFuelScene")`

**StreakMaze — foute keuzes + substeps:**
- `puzzles/StreakMaze.ts` → in `enterRoom()`:
  - Als `room.isEndWrong` → `this.game.events.emit("telemetry:attempt_fail", "StreakMaze", chosenLabel, lastStageId)`
  - Bij elke stage-transitie → `this.game.events.emit("telemetry:substep", "StreakMaze", roomId)`

**Puzzles met abandon-snapshots (1-3 regels per puzzle):**
- `puzzles/kist_van_quadratus/kvq_antwoorden_invullen.ts` → bij elke `saveValues()`: `this.game.events.emit("telemetry:puzzle_snapshot", { slots: values })`
- `puzzles/SudokuScene.ts` → bij `updateCell()` of `closeCodePopup()`: `this.game.events.emit("telemetry:puzzle_snapshot", { filledCells: count })`
- `puzzles/tangram/TangramSelectScene.ts` → bij `create()`: `this.game.events.emit("telemetry:puzzle_snapshot", { solved: [...] })`
- `puzzles/DominoScene.ts` → bij `checkRules()`: `this.game.events.emit("telemetry:puzzle_snapshot", { rulesPassed: n, totalRules: 6 })`

### Stap 6: Analyse-scripts updaten
**Bestanden:** `scripts/telemetry-stats.mjs`
- Unieke spelers (per `playerId`)
- Sessies per speler
- Puzzle abandon rates per puzzle
- Frustration score: `(abandons + fails) / starts`
- Substep completion rates (LogicTower floors, Tangram dieren)
- Meest voorkomende foute antwoorden per puzzle
- Funnel-analyse
- Asset load time P50/P95 per connectionType

### Stap 7: Firestore security rules deployen
**Bestand:** `firestore.rules`
- Create-only rules voor telemetry collecties (al gepland, nog niet gedeployed)
- Veldvalidatie: type checks + max lengtes
- `allow read, update, delete: if false` voor alle telemetry collecties

---

## Analyse: Key metrics die mogelijk worden

### Frustratiescore per puzzle
```
frustration = (abandons + retries) / starts
```
Score > 0.5 → meer dan helft van de spelers haakt af of moet opnieuw proberen → puzzle aanpassen.

### Funnel
```
TitleScene bezocht           → 100%
Info-tabs bekeken            →  ?%
Game gestart                 →  ?%
ShipFuel opgelost            →  ?%
≥3 puzzles opgelost          →  ?%
≥80 energy                   →  ?%
Game voltooid                →  ?%
Prize form ingevuld          →  ?%
Vierkant-website bezocht     →  ?%
```

### Oplossingspercentage
- Per `playerId`: hoeveel unieke `sessionId`s met `game_complete`?
- 0 = niet opgelost, 1 = in 1 sessie, 2+ = meerdere sessies nodig

### Navigatieproblemen
- Face visits zonder puzzle-interactie → speler dwaalt rond
- Dezelfde faces herhaaldelijk bezoeken → lost / zoekt iets

### Performance
- P50/P95 van `asset_load_time` per `connectionType`
- Als P95 > 15s voor `"3g"` → overweeg kleinere assets of progressief laden

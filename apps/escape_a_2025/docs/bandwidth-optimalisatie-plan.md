# Bandwidth Optimalisatie Plan

## Huidige situatie

- **9.2 GB in 2.5 dagen** (~3.7 GB/dag, ~110 GB/maand projectie)
- **~154 unieke bezoekers/dag**, elk ~24 MB download
- Firebase gratis limiet: 10 GB/maand, Blaze plan: $0.15/GB daarboven
- Geschatte kosten bij huidig gebruik: ~$15/maand

### Waar gaat die 24 MB per bezoeker heen?

| Categorie | Grootte |
|-----------|---------|
| Images (60 stuks, ongecomprimeerd PNG) | ~18 MB |
| JS bundle (Phaser 3 + game code) | 1.7 MB |
| Verspilde dubbele loads (bugs) | ~1.4 MB |
| HTML/CSS/overig | ~0.3 MB |
| **Totaal** | **~24 MB** |

### Gevonden bugs in PreloadScene.ts

- **Regel 77-78:** Key `"tower"` wordt twee keer geladen — eerst `tower.png` (106 KB), dan overschreven met `brokenpanel.png`. De eerste download is weggegooid.
- **Regel 81-82:** Key `"balance_scale_puzzle"` wordt geladen met het 1.3 MB bestand, dan direct overschreven met de 140 KB no-background variant. 1.3 MB verspild per bezoeker.

---

## Implementatieplan

### Stap 1: Bugs fixen + cache headers

**Dubbele loads fixen in `PreloadScene.ts`:**
- Regel 77: rename key `"tower"` naar `"brokenpanel"` of verwijder de eerste load (afhankelijk van welke image daadwerkelijk gebruikt wordt)
- Regel 81: verwijder de load van `balance_scale_puzzle.png` (1.3 MB), houd alleen `balance_scale_puzzle_nobg.png` (140 KB)
- Besparing: ~1.4 MB per bezoeker

**Cache headers toevoegen aan `firebase.json`:**
- Hashed JS/CSS (Vite output): `max-age=31536000, immutable` (1 jaar)
- Images: `max-age=604800` (7 dagen)
- Effect: terugkerende bezoekers downloaden niks opnieuw

**Bestanden:** `firebase.json`, `PreloadScene.ts`

### Stap 2: Image compressie via Vite plugin

**Aanpak:** Vite plugin die tijdens `npm run build` alle PNGs in `public/assets/` converteert naar WebP (quality 80) en oversized images verkleint naar max canvasgrootte (1280px breed). Draait bij elke build (paar seconden extra).

- Dependency toevoegen: `vite-plugin-imagemin` (of vergelijkbaar)
- Plugin configureren in `vite.config.js` met WebP output, quality 80, max breedte 1280px
- Originele PNGs blijven in de repo (bronbestanden)
- Alle `this.load.image()` paden in scene bestanden updaten van `.png` naar `.webp`

**Geschatte reductie:** ~18 MB images -> ~2 MB WebP. Per bezoeker: ~24 MB -> ~4-5 MB.

**Bestanden:**
- `vite.config.js` (plugin toevoegen)
- `package.json` (dependency toevoegen)
- `PreloadScene.ts` + alle scene bestanden met `this.load.image()` (extensies updaten)

### Stap 3: Lazy loading — assets pas laden na "Start"

**Probleem:** TitleScene heeft nul images nodig, maar PreloadScene laadt alle 60 images _voor_ het beginscherm verschijnt.

**Aanpak:**
1. `BootScene` gaat direct naar `TitleScene` (skipt PreloadScene)
2. Nieuwe `GamePreloadScene` met de huidige PreloadScene loading logica + loading bar
3. `TitleScene`: klik op "Start" -> `GamePreloadScene` ipv direct naar `IntroScene`
4. `TitleScene`: klik op "Verder spelen" -> `GamePreloadScene` die daarna naar de juiste scene gaat

**Effect:** Bezoekers die niet spelen downloaden alleen de JS bundle (~2 MB). Beginscherm laadt direct.

**Bestanden:**
- `BootScene.ts` — scene start aanpassen
- `TitleScene.ts` — start/resume routing aanpassen
- `PreloadScene.ts` — hernoemen/refactoren naar `GamePreloadScene.ts`
- `main.ts` — scene lijst updaten

---

## Verwacht resultaat

| Scenario | Per bezoeker | Maandelijks (154/dag) |
|----------|-------------|----------------------|
| Nu | 24 MB | ~110 GB |
| Na stap 1-3 (speelt) | ~3-4 MB | ~15-18 GB |
| Na stap 1-3 (bounced) | ~2 MB | afhankelijk van bounce rate |
| Overage kosten | | ~$1-1.20/maand |

## Verificatie

- `npm run build` runnen en `dist/` grootte vergelijken (voor/na)
- Visueel controleren dat WebP images er goed uitzien in de game
- PR aanmaken -> Firebase preview deployment testen
- Browser DevTools Network tab: controleer WebP loading + cache headers
- Na deploy: Firebase console bandwidth monitoren

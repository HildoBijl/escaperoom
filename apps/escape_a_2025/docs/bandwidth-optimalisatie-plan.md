# Bandwidth Optimalisatie Plan

## Situatie voor optimalisatie

- **12.9 GB in 4 dagen** (2-5 feb), stijgend verkeer
- **3,748 sessies gestart** in die periode (~645 unieke bezoekers, ~5.8 sessies per bezoeker)
- Verkeer groeit snel: 87 → 802 → 1.062 → 1.797 sessies/dag
- Firebase gratis limiet: 10 GB/maand, Blaze plan: $0.15/GB daarboven
- Browsers cachen heuristisch, waardoor herhaalde sessies minder bandwidth kosten
- Geschatte ~20 MB per unieke bezoeker (eerste bezoek, gzip-gecomprimeerd)

### Waar ging die ~20 MB per bezoeker heen?

| Categorie | Grootte |
|-----------|---------|
| Images (53 PNGs, ongecomprimeerd) | ~18 MB |
| JS bundle (Phaser 3 + Firebase SDK + game code) | 1.7 MB (485 KB gzipped) |
| Verspilde dubbele loads (bugs) | ~1.4 MB |
| HTML/CSS/overig | ~0.3 MB |

### Gevonden bugs in PreloadScene.ts

- Key `"tower"` werd twee keer geladen — eerst `tower.png`, dan `brokenpanel.png` op dezelfde key. In Phaser wint de eerste load, dus `brokenpanel.png` werd gedownload maar weggegooid.
- Key `"balance_scale_puzzle"` werd geladen met het 1.3 MB bestand, dan overschreven met de 140 KB no-background variant. Het spel gebruikte de eerste (met achtergrond), dus de nobg download was verspild.

---

## Uitgevoerde optimalisaties

### Stap 1: Bugs fixen + cache headers ✓

**Dubbele loads gefixt in `PreloadScene.ts`:**
- `"tower"` en `"brokenpanel"` zijn nu aparte keys (voorheen beide op key `"tower"`)
- `"balance_scale_puzzle"` laadt nu alleen `balance_scale_puzzle.png` (met achtergrond, de versie die daadwerkelijk werd gebruikt)
- Besparing: ~1.4 MB per bezoeker

**Cache headers toegevoegd aan `firebase.json`:**
- Hashed JS/CSS (Vite output): `max-age=31536000, immutable` (1 jaar)
- Images: `max-age=604800` (7 dagen)

### Stap 2: Image compressie via custom Vite plugin ✓

**Aanpak:** Custom Vite plugin met `sharp` die tijdens `npm run build`:
- Alle PNGs in `public/assets/` converteert naar WebP (quality 80)
- Oversized images verkleint naar max 1280px breed
- Originele PNGs verwijdert uit `dist/`

Dev middleware zorgt ervoor dat `.webp` requests in dev mode terugvallen op `.png` bestanden in `public/`.

**Resultaat:** 17.9 MB → 1.3 MB images (93% reductie). Totale `dist/`: 3.3 MB.

**Bestanden:**
- `vite.config.js` — custom plugin + dev middleware
- `package.json` — `sharp` als devDependency
- Alle scene bestanden — `.png` referenties geüpdatet naar `.webp`

### Stap 3: Lazy loading — assets pas laden na "Start" ✓

**Aanpak:** PreloadScene hergebruikt met een `targetScene` parameter (geen nieuw bestand nodig).

- `BootScene` gaat direct naar `TitleScene` (skipt PreloadScene)
- `TitleScene` "Start" → `PreloadScene` met `{ targetScene: "IntroScene" }`
- `TitleScene` "Hervat spel" → `PreloadScene` met `{ targetScene: "Face1Scene" }` of `"CockpitScene"`
- `PreloadScene` laadt alle assets, toont loading bar, gaat dan naar `targetScene`

**Effect:** Beginscherm laadt instant. Bezoekers die niet spelen downloaden alleen de JS bundle (~485 KB gzipped).

### Extra: Debug menu automatisch in dev mode ✓

`DEBUG` flag in `main.ts` veranderd van hardcoded `false` naar `import.meta.env.DEV`. Debug menu is automatisch aan in dev, uit in builds.

---

## Resultaat

| Scenario | Dist grootte | Over de lijn (gzipped) |
|----------|-------------|----------------------|
| Voor optimalisatie | 24 MB | ~20 MB |
| Na optimalisatie (speelt) | 3.3 MB | ~2 MB |
| Na optimalisatie (bounced) | n.v.t. | ~485 KB (alleen JS) |

## Mogelijke vervolgstappen

- **Hosting migratie naar Cloudflare Pages** — onbeperkte gratis bandbreedte (vs 10 GB/maand Firebase). Firebase blijft voor Firestore.
- **Phaser tree-shaking/code-splitting** — JS bundle (1.7 MB) is nu het grootste bestand. Phaser is lastig te tree-shaken, maar code-splitting per scene is mogelijk.

## Verificatie

- [x] `npm run build` en `dist/` grootte checken (3.3 MB)
- [ ] Visueel controleren dat WebP images er goed uitzien in de game
- [ ] PR aanmaken → Firebase preview deployment testen
- [ ] Browser DevTools Network tab: controleer WebP loading + cache headers
- [ ] Na deploy: Firebase console bandwidth monitoren

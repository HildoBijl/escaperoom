# Vierkant Escape Rooms — repo-kaart

Deze repo bevat meerdere escape rooms naast elkaar. Ze delen een hostingconfig,
maar geen code: elke app heeft zijn eigen `package.json` en `node_modules`.

## Naamgeving: het jaartal is het kampjaar

Een appmap heet `escape_<kamp>_<kampjaar>` — het jaar waarin het kamp
plaatsvindt, **niet** het bouwjaar. Een room wordt het jaar ervóór gebouwd, over
twee kalenderjaren heen, dus het bouwjaar is geen bruikbaar label.

| Map | Voor kamp | Gebouwd in | Status |
|---|---|---|---|
| `apps/escape_b_2025/` | kamp B, zomer 2025 (React + MUI + Vite) | 2024–2025 | Live, **bevroren** |
| `apps/escape_a_2026/` | kamp A, zomer 2026 (Phaser + Vite) | 2025–2026 | Live, **bevroren** |
| `apps/puzzle-lab/` | — (werkplaats, geen room) | 2026– | **Actief werk** |

Deze mappen heetten tot augustus 2026 `escape_b_2024` en `escape_a_2025`, naar
het bouwjaar. Kom je die oude namen nog ergens tegen, dan is dat een restant.

Deze conventie geldt **alleen voor rooms**. `apps/puzzle-lab/` is geen room maar
een werkplaats: het hoort bij geen enkel kamp, krijgt dus geen jaartal, en blijft
`puzzle-lab` heten. Hernoem het niet naar een kamp of jaar.

"Bevroren" betekent: afgerond en in productie, niet in actieve ontwikkeling.
Geen verbod — ze mogen aangepast worden als daarom gevraagd wordt — maar wees er
terughoudend, want ze zijn getest en draaien voor bezoekers.

## Actief werk: de rooms van 2027

De rooms voor kamp A en kamp C van 2027 worden nu gebouwd, via het puzzellab in
`apps/puzzle-lab/` — zie `apps/puzzle-lab/README.md` voor het puzzelcontract.

Het lab is een puzzelgalerij zonder verhaal, nog niet gesplitst per kamp: er is
tot nu toe geen puzzel die specifiek voor A of voor C is. Of de twee rooms
straks één app met een kampvariant worden of twee losse apps, is bewust nog niet
beslist — dat volgt zodra er inhoud is die per kamp verschilt. Ga er dus niet
van uit dat `puzzle-lab` later één van de rooms wordt.

Stack: React + TypeScript + Vite, met SVG en CSS voor graphics. **Geen Phaser** —
dat blijft beperkt tot `escape_a_2026`, dat niet omgebouwd wordt. Uit die room
zijn alleen de telemetrie en de Firebase-config framework-onafhankelijk en
herbruikbaar; `DialogManager` en `DebugMenu` zijn Phaser-scenes en worden
opnieuw geschreven.

## Zoeken

De twee bevroren rooms zijn samen ~22.000 regels en overstemmen anders elke
zoekopdracht. Zoek je iets voor het werk van 2027, beperk dat dan tot
`apps/puzzle-lab/` in plaats van repo-breed.

## Werken en deployen

- Per app installeren: `npm install --prefix apps/<map>`. Er is geen gedeelde
  installatie; `npm run dev` en `npm run build` (zonder suffix) hebben beide
  rooms geïnstalleerd nodig.
- De publieke URL's staan los van de mapnamen: `firebase.json` kent alleen
  `dist` en `/kamp-b/`, en `scripts/merge-builds.cjs` bepaalt welke room waar
  belandt. Een map hernoemen verandert de site dus niet.
- Push naar `main` = live-deploy van de hele site. Een PR openen bouwt ook alles.
- Het lab live zetten voor het team gaat via een push naar de branch
  `puzzle-lab`, die zijn eigen workflow en preview-channel heeft.
- Zie `README.md` voor installatie, builden en de volledige deploy-uitleg.

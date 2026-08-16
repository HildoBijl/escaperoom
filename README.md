# Vierkant Escape Rooms

Deze repository bevat alle gemaakte escape rooms en host ze samen op één site.
Met de huidige configuratie heb je:
- https://vierkantescaperoom.nl/
 → de escape room voor kamp A van 2026
- https://vierkantescaperoom.nl/kamp-b/
 → de escape room voor kamp B van 2025

## 🗂️ Projectstructuur
```
apps/
  escape_a_2026/    ← kamp A 2026 (Phaser + Vite)
  escape_b_2025/    ← kamp B 2025 (React + Vite)
scripts/
  merge-builds.cjs   ← script dat beide builds samenvoegt in /dist/
dist/                ← uiteindelijke build output (voor Firebase)
firebase.json        ← Firebase Hosting-configuratie
```

### 📅 Naamgeving: het jaartal is het kampjaar

Een appmap heet `escape_<kamp>_<kampjaar>`. Het jaartal is het jaar waarin het
kamp plaatsvindt, **niet** het jaar waarin de room gebouwd is.

| Map | Voor kamp | Gebouwd in |
|---|---|---|
| `escape_b_2025` | kamp B, zomer 2025 | 2024–2025 |
| `escape_a_2026` | kamp A, zomer 2026 | 2025–2026 |

Een room wordt namelijk altijd het jaar ervóór gebouwd, over twee kalenderjaren
heen — het bouwjaar is dus geen bruikbaar label. (De subsidie voor een kamp in
jaar X wordt ook in jaar X-1 verstrekt, wat de oorspronkelijke, verwarrende
nummering verklaart: deze mappen heetten tot augustus 2026 `escape_b_2024` en
`escape_a_2025`, naar het bouwjaar.)

De spelteksten zijn hierin leidend: `escape_a_2026` zegt zelf "de escaperoom
van Vierkant voor Wiskunde voor kamp A van 2026".

**Deze conventie geldt alleen voor rooms.** `apps/puzzle-lab/` is geen room maar
een werkplaats — het hoort bij geen enkel kamp en krijgt dus geen jaartal. Die
map blijft `puzzle-lab` heten, ook als er rooms omheen komen en verdwijnen.

## 📦 Installeren

Elke app heeft zijn eigen `node_modules` — er is geen gedeelde installatie. Je
installeert dus per app, en alleen die waaraan je werkt:

```
npm install --prefix apps/escape_a_2026   # kamp A 2026
npm install --prefix apps/escape_b_2025   # kamp B 2025
npm install                               # root (nodig voor 'npm run dev' en de telemetriescripts)
```

`node_modules` staat in `.gitignore` en zit dus niet in de repo. Werk je een
tijd niet aan een room, dan kun je zijn `node_modules` gerust weggooien om
schijfruimte en trage bestandsscans te besparen — bovenstaand commando zet hem
zo weer terug. Dat raakt git en de deploy niet: GitHub Actions installeert op de
runner altijd zelf.

> Draai je `npm run dev` of `npm run build` (zonder suffix), dan heb je **beide**
> rooms geïnstalleerd nodig — die commando's raken alle apps.

## ⚙️ Ontwikkelen

Je kunt een individuele escape room lokaal draaien of beide tegelijk.

### Eén app draaien
```
# Kamp A 2026
npm run dev:2026

# Kamp B 2025
npm run dev:2025
```

### Beide tegelijk draaien
```
npm run dev
```

Dit gebruikt het concurrently-pakket en draait:
- kamp A 2026 op http://localhost:5173/
- kamp B 2025 op http://localhost:5174/

> De app op 5173 proxiet /kamp-b automatisch naar 5174,
zodat je tijdens ontwikkeling alles via één URL kunt testen.

## 🧱 Builden en lokaal testen
Maak de gecombineerde productiebuild:
```
npm run build
```

De resultaten komen in de map `/dist/`:

```
dist/
  index.html          ← kamp A 2026 (root)
  kamp-b/             ← kamp B 2025 (submap)
    index.html
```

### Testen met Firebase Emulator
Gebruik de Firebase Hosting emulator om de volledige hostingconfiguratie lokaal te testen:
```
npx firebase-tools emulators:start --only hosting
```

Daarna kun je testen via:
- http://localhost:5000/
 → kamp A 2026

- http://localhost:5000/kamp-b/
 → kamp B 2025

> Gebruik altijd de emulator (en niet `npx serve`), omdat de kamp-b-app Firebase-endpoints `(/__/firebase/...)` verwacht.

## 🧩 Nieuwe escape room toevoegen

1. Maak een nieuwe map in `apps/`, met het **kampjaar** in de naam — dus
   `apps/escape_c_2027/` voor kamp C van 2027, ook al bouw je hem in 2026
2. Installeer dependencies:
```
npm install --prefix apps/escape_c_2027
```
3. Kies een vrije dev-port in de lokale vite.config.js of package.json (5173 en 5174 zijn al in gebruik)
4. Mocht je de nieuwe escape room op de main URL willen, zul je de vorige escape room licht moeten aanpassen om naar een suburl te verplaatsen. (in vite kan dat meestal in de `vite.config.js`)
5. Voeg in de root-`package.json` de nieuwe scripts toe:
```
"dev:2027": "npm run dev --prefix apps/escape_c_2027",
"build:2027": "npm run build --prefix apps/escape_c_2027"
```
6. Update scripts/merge-builds.cjs om de nieuwe folder te kopiëren, 
7. Run `npm run build` om te testen of alles correct in `/dist/` verschijnt
8. Controleer lokaal met `npx firebase-tools emulators:start --only hosting`

## 🚀 Productie-deploy
GitHub Actions doet automatisch een deploy naar Firebase Hosting bij een merge naar main.

Het workflow-bestand voert uit:
```
- run: npm ci && npm run build
- uses: FirebaseExtended/action-hosting-deploy@v0
```

Dat betekent dat:
- `npm run build` beide apps bouwt en samenvoegt
- de map `/dist/` wordt gedeployed
- firebase.json zorgt dat:
  - / naar de nieuwe escape room gaat
  - /kamp-b/** naar de oude escape room wordt herschreven

Geen extra stappen nodig voor deploy 🎉

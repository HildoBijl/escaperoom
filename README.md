# Vierkant Escape Rooms

Deze repository bevat alle gemaakte escape rooms en host ze samen op één site.
Met de huidige configuratie heb je:
- https://vierkantescaperoom.nl/
 → de nieuwe escape room (Kamp A 2025)
- https://vierkantescaperoom.nl/2024/
 → de escape room van Kamp B (2024)

## 🗂️ Projectstructuur
```
apps/
  escape_a_2025/    ← nieuwe escape room (Phaser + Vite)
  escape_b_2024/    ← vorige escape room (React + Vite)
scripts/
  merge-builds.cjs   ← script dat beide builds samenvoegt in /dist/
dist/                ← uiteindelijke build output (voor Firebase)
firebase.json        ← Firebase Hosting-configuratie
```

## ⚙️ Ontwikkelen

Je kunt een individuele escape room lokaal draaien of beide tegelijk.

### Eén app draaien
```
# Nieuwe (2025)
npm run dev:2025

# Oude (2024)
npm run dev:2024
```

### Beide tegelijk draaien
```
npm run dev
```

Dit gebruikt het concurrently-pakket en draait:
- de nieuwe app op http://localhost:5173/
- de oude app op http://localhost:5174/

> De nieuwe app (5173) proxiet /2024/ automatisch naar 5174,
zodat je tijdens ontwikkeling alles via één URL kunt testen.

## 🧱 Builden en lokaal testen
Maak de gecombineerde productiebuild:
```
npm run build
```

De resultaten komen in de map `/dist/`:

```
dist/
  index.html          ← nieuwe escape room (root)
  2024/               ← oude escape room (submap)
    index.html
```

### Testen met Firebase Emulator
Gebruik de Firebase Hosting emulator om de volledige hostingconfiguratie lokaal te testen:
```
npx firebase-tools emulators:start --only hosting
```

Daarna kun je testen via:
- http://localhost:5000/
 → nieuwe escape room

- http://localhost:5000/2024/
 → oude escape room

> Gebruik altijd de emulator (en niet `npx serve`), omdat de 2024-app Firebase-endpoints `(/__/firebase/...)` verwacht.

## 🧩 Nieuwe escape room toevoegen

1. Maak een nieuwe map in `apps/`, bijv. `apps/escape_c_2026/`
2. Installeer dependencies:
```
cd apps/escape_c_2026
npm install
```
3. Kies een vrije dev-port in de lokale vite.config.js of package.json (5173 en 5174 zijn al in gebruik)
4. Mocht je de nieuwe escape room op de main URL willen, zul je de vorige escape room licht moeten aanpassen om naar een suburl te verplaatsen. (in vite kan dat meestal in de `vite.config.js`)
5. Voeg in de root-`package.json` de nieuwe scripts toe:
```
"dev:2026": "npm run dev --prefix apps/escape_c_2026",
"build:2026": "npm run build --prefix apps/escape_c_2026"
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
  - /2024/** naar de oude escape room wordt herschreven

Geen extra stappen nodig voor deploy 🎉

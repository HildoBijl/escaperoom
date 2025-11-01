# Vierkant escape rooms
Deze repository heeft alle gemaakte voorgaande escape rooms, en host ze samen op een server. Met de huidige configuratie heb je
- https://vierkantescaperoom.nl/: de nieuwe escape room (Kamp A 2025)
- https://vierkantescaperoom.nl/2024/: de escape room van Kamp B (2024)

## Hoe mee te werken
De apps folder heeft alle escape rooms compleet gekopieerd erin zitten. Deze kun je los draaien door simpelweg daarnaartoe te cd'en en te runnen. Je kunt ze ook tegelijk runnen met `npm run dev` vanuit de repo root (met `concurrently` package). Ook kun je de distributie testen door eerst te builden met `npm run build`, en dan te serven met `npx firebase-tools emulators:start --only hosting`.

## Hoe nieuwe toe te voegen
1. Maak een nieuwe folder in apps/ met de nieuwe escape room
2. Installeer de node modules, (cd ernaartoe, npm install in subfolder)
3. Zorg ervoor dat de applicatie voor dev op een andere port word gerunt (nu zijn 5173 en 5174 in gebruik door A en B respectievelijk). 
4. Breid de package.json commands uit met de nieuwe folder. 

Voor productie:
5. Pas de `scripts/merge-builds.cjs` aan met een extra folder. 

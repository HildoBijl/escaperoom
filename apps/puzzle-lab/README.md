# Puzzellab

Werkomgeving om puzzelideeën te bouwen en te tonen, vooruitlopend op de twee
escape rooms voor kamp A en kamp C (2027). Geen verhaal, geen intro, geen
assets: een lijst puzzels, klik er een aan en speel hem.

De lab staat op een privé-URL (Firebase preview channel) — zie de root-README.

## Draaien

```
npm install --prefix apps/puzzle-lab   # eenmalig
npm run dev:lab                        # http://localhost:5175
```

## Tech

React 18 + TypeScript + Vite. Graphics met SVG en CSS.

**Geen Phaser.** De room voor kamp A van 2026 draait daarop, maar voor puzzels
(grids, invoervelden, klikbare vormen) is een canvas-engine een extra laag die
in de weg zit. Alles wat Phaser met sprites doet, doet SVG hier met vormen die
je direct in de code beschrijft — en animaties zijn gewone CSS-transitions.
Zie `src/puzzles/weegschaal/` voor hoe dat eruitziet.

## Uitgangspunt: invoer van spelers

Zodra een room iets publiceert wat een kind zelf intypt — een leaderboard, een
gastenboek, een naam bij een score — is dat werk dat blijft terugkomen. In het
leaderboard van kamp A 2026 (825 inzendingen over zes maanden) stond onder meer
`sex`, `drugs handelaar123` en `KAPTEN JACK SPEEAROW TUU TUU TUDUDUDU…`.

De afspraak voor 2027, zodat dat weinig kost:

**Eigen voornaam mag.** Dat is bewust: jezelf terugzien in de lijst is de
bevestiging dat je inzending gelukt is, en meteen de beloning. Een succesmelding
vervangt dat niet.

**Valideer op vorm, niet op inhoud.** Eén woord, alleen letters plus koppelteken
en apostrof, maximaal 20 tekens. Dat weert de graffiti zonder ooit een echte
naam te weigeren: `Anne-Marie` en `Ayşe` komen er gewoon door.

**Geen woordenlijst.** Die is triviaal te omzeilen (`s3x`, `se x`, `SEKS`) en
raakt onschuldige namen: `Sexbierum` is een Fries dorp, `Lulof` een achternaam.
Je krijgt misgrijpen én valse treffers, voor permanent onderhoud.

**Wat er dan nog doorheen komt, ruim je periodiek op.** Bij dit volume is dat
een kwartier per kwartaal. `scripts/output/leaderboard-controle.txt` laat zien
hoe: alle inzendingen op alfabet met hun document-ID, aanvinken wat weg moet.

**Publiceer niet meer dan nodig.** Kamp B 2025 toont voornaam, woonplaats én
leeftijd van kinderen op een openbare pagina. Dat is meer dan je van een
minderjarige online wilt hebben staan. Een voornaam alleen volstaat.

Komt er in 2027 een prijsronde met echte instroom, dan is een goedkeuringswachtrij
— inzendingen pas zichtbaar na akkoord — de robuuste stap. Die is niet te
omzeilen, want er kijkt een mens naar. Bouw hem pas als het volume erom vraagt.

## Een puzzel toevoegen

1. Maak `src/puzzles/<naam>/<Naam>Puzzle.tsx`.
2. Exporteer een component die `PuzzleProps` aanneemt (uit `../types`) en
   `onSolved()` aanroept zodra de speler klaar is.
3. Voeg een regel toe aan de array in `src/puzzles/registry.ts`.
4. Klaar — de puzzel staat in de galerij en heeft een eigen URL
   (`#/puzzel/<id>`) die je kunt doorsturen.

Kopieer `weegschaal/` als startpunt; die is als sjabloon geschreven.

### De enige harde regel

**Een puzzel importeert niets uit de lab, behalve `puzzles/types.ts`.**

Niet uit `components/`, niet uit `App.tsx`. De reden: dezelfde puzzels gaan
straks in twéé rooms draaien, met een ander verhaal, een andere volgorde en een
andere skin eromheen. Een puzzel die niets van zijn omgeving weet, verhuist als
losse map mee. Een puzzel die de galerij importeert, moet herschreven worden.

Concreet betekent dat:
- geen terugknop, geen "opnieuw", geen "goed gedaan!" in de puzzel zelf — dat
  levert de omgeving (`PuzzleFrame` in de lab, een scene in de room)
- geen navigatie: roep `onSolved()` aan en laat de omgeving beslissen wat er
  gebeurt
- resetten hoeft niet: de omgeving mount de puzzel opnieuw

Wél toegestaan: de CSS-variabelen uit `src/styles.css` (`--text`, `--accent`,
`--radius`, …). Die zijn expliciet bedoeld om overschreven te worden, zodat een
room de hele set puzzels in één keer kan herkleuren.

## Wat de omgeving levert

`PuzzleProps` (zie `src/puzzles/types.ts`):

| prop | verplicht | betekenis |
| --- | --- | --- |
| `onSolved()` | ja | roep één keer aan als de puzzel opgelost is |
| `onProgress(f)` | nee | voortgang 0..1; de lab toont het als balk |
| `difficulty` | nee | `'makkelijk' \| 'normaal' \| 'moeilijk'` |

`PuzzleMeta` in de registry is voor de puzzelmakers, niet voor de code: titel,
samenvatting, doelgroep, welke vaardigheden het oefent, hoe ver het is
(`idee` / `prototype` / `af`) en losse notities. Dat is wat de galerij toont.

## Bouwen

```
npm run build:lab
```

Output gaat naar `deploy/lab/dist/` — bewust niet naar de root-`dist/`, want
daar staat de live site. Zie `deploy/lab/README.md`.

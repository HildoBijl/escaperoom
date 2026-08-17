# TODO

Twee soorten werk, met een andere afweging. Aan de bevroren rooms verander je zo
weinig mogelijk en alleen met goede reden, want ze staan live en zijn getest.
Het werk voor 2027 is nieuwbouw en mag vrij bewegen.

## Bestaande rooms en infrastructuur

- [ ] **Leaderboard kamp B: kolom woonplaats weghalen.**
      `apps/escape_b_2025/src/pages/Leaderboard.jsx` — verwijder de header op
      regel 41 en het veld op regel 47, en zet `gridTemplateColumns` op regel 39
      van `'3fr 3fr 1fr 2fr'` naar `'3fr 1fr 2fr'`.

      Let op: dit haalt de kolom alleen uit de weergave. Het formulier blijft de
      woonplaats vragen (`Game/Game.jsx`), de rules blijven hem eisen
      (`firestore.rules`), en de bestaande inzendingen houden hem. Wil je hem
      echt niet meer verzamelen — en voor een pagina met gegevens van kinderen
      is dat te verdedigen — dan hoort daar een aparte beslissing bij, want het
      veld uit het formulier halen betekent ook de rules aanpassen.

- [ ] **Leaderboard kamp B: jaartal bij de datum.**
      Zelfde bestand, regel 49: voeg `year: "numeric"` toe aan de opties van
      `toLocaleDateString`. De lijst loopt over meerdere jaren, dus "8 mei"
      zonder jaartal is niet meer eenduidig.

- [ ] **Twee ongebruikte IAM-rollen weghalen** bij
      `github-action-871542807@vierkantescaperoom.iam.gserviceaccount.com`:
      `Cloud Functions Developer` (224 rechten) en `Cloud Run Viewer` (50).
      Samen 85% van de 264 rechten van dat account, en aantoonbaar ongebruikt —
      de Cloud Functions API is in dit project nooit ingeschakeld en er is geen
      `functions`-sectie in `firebase.json`. Daarna houdt het account ~40
      rechten over: Hosting deployen, rules publiceren, Auth beheren.
      Via https://console.cloud.google.com/iam-admin/iam?project=vierkantescaperoom

## Rooms van 2027 (kamp A en kamp C)

Dit werk speelt in `apps/puzzle-lab/`, op de branch `puzzle-lab`.

- [ ] **Meer puzzels in het puzzellab.** De hoofdbezigheid tot september 2026.
      Zie `apps/puzzle-lab/README.md` voor het puzzelcontract en
      `src/puzzles/weegschaal/` als voorbeeld.

- [ ] **Gameplay: navigeren over het kampterrein.** De laag om de puzzels heen:
      de speler loopt over het terrein en komt puzzels tegen. Nu nog is het lab
      een platte lijst waar je een puzzel aanklikt.

      Hier hangt de nog open vraag aan of de twee rooms één app worden met de
      kampvariant als laag, of twee losse apps met een gedeeld pakket. Zodra de
      navigatie er is, wordt dat concreet — dat is het moment om te kiezen.

## Afgerond

- [x] Leaderboard kamp A nagelopen (816 inzendingen) — de rest is in orde
      bevonden. Negen ongepaste inzendingen zijn op 2026-08-16 verwijderd met
      `scripts/leaderboard-remove.mjs`.

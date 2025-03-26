import { Link } from 'react-router-dom'
import Alert from '@mui/material/Alert'

import { Subpage, Image } from 'components'
import { OfficeOverview } from 'assets'

export function Home() {
	return <Subpage>
		<p>Kun jij ontsnappen uit de online wiskundige Escape Room &quot;De verlaten school&quot;? Los alle raadsels op en win een gratis plek voor een zomerkamp!</p>
		<p style={{ textAlign: 'center' }}><Link to="/spel">Ga naar de Escape Room</Link></p>
		<Image src={OfficeOverview} />
		<p>De Escape Room is gericht op scholieren uit de onderbouw van de middelbare school die wel houden van raadsels, getallen, en een beetje uitdaging. Zit jij dit schooljaar in klas 1, 2 of 3 van het voortgezet onderwijs? En lukt het je om de Escape Room voor 13 juni 2025 op te lossen? Dan win je mogelijk een gratis plek voor een <Link to="https://www.vierkantvoorwiskunde.nl/">Vierkant voor Wiskunde</Link> zomerkamp! Zie de <Link to="/info">Infopagina</Link> voor details en voorwaarden.</p>

		<h3>Extra prijs voor iedereen!</h3>
		<p>Door de Vierkant Escape Room correct op te lossen, kan iedereen (ook als je niet in de doelgroep valt) een individueel kaartje claimen voor het <a href="https://platformwiskunde.nl/mathfest/" target="_blank">wiskundefestival Mathfest</a> op zondag 11 mei in Utrecht! Dat kaartje is inclusief drankjes, versnaperingen gedurende de middag, en avondeten van de foodtrucks in de avond. Er zijn in totaal ook 25 familiekaartjes beschikbaar. Die gelden voor 3-4 mensen, eveneens inclusief drankjes, versnaperingen gedurende de middag, en avondeten van de foodtrucks in de avond.</p>
		<p>Heb je de Escape Room goed opgelost en wil je een kaartje claimen? Na het oplossen van de Escape Room kun je een codewoord vinden. Neem met dit codewoord contact op met <a href="mailto:pr@platformwiskunde.nl">pr@platformwiskunde.nl</a> om je ticket te claimen!</p>

		<Alert severity="info" sx={{ my: 4 }}>De Escape Room is ontworpen om zo&apos;n 5-10 uur te kosten, verspreid over meerdere dagen. We raden aan om de Escape Room samen te doen. Dat is wel zo leuk! De raadsels zijn best pittig, dus mogelijk kun je elkaar helpen. Als elke persoon de Escape Room op een eigen device (laptop, tablet, telefoon) doet, dan kan iedereen los rondlopen en hints zoeken, om vervolgens samen de raadsels op te lossen.</Alert>
	</Subpage>
}

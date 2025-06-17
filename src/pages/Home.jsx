import { Link } from 'react-router-dom'

import { Subpage, Image } from 'components'
import { OfficeOverview } from 'assets'

export function Home() {
	return <Subpage>
		<p>Kun jij ontsnappen uit de online wiskundige Escape Room &quot;De verlaten school&quot;? Los alle raadsels op en claim een plek op de <Link to="/leaderboard">lijst van oplossers</Link>!</p>
		<p style={{ textAlign: 'center' }}><Link to="/spel">Ga naar de Escape Room</Link></p>
		<Image src={OfficeOverview} />
		<p>De Escape Room is gericht op middelbare scholieren die wel houden van raadsels, getallen, en een beetje uitdaging. Hij is ontworpen om zo&apos;n 5-10 uur te kosten, verspreid over meerdere dagen.</p>
		<p>We raden aan om de Escape Room samen te doen. Dat is wel zo leuk! De raadsels zijn best pittig, dus mogelijk kun je elkaar helpen. Als elke persoon de Escape Room op een eigen device (laptop, tablet, telefoon) doet, dan kan iedereen los rondlopen en hints zoeken, om vervolgens samen de raadsels op te lossen.</p>
	</Subpage>
}

import { Link } from 'react-router-dom'

import { Subpage, Image } from 'components'
import { OfficeOverview } from 'assets'

export function Home() {
	return <Subpage>
		<p>Kun jij ontsnappen uit de online wiskundige Escape Room &quot;De verlaten school&quot;? Los alle raadsels op en win een gratis plek voor een zomerkamp!</p>
		<p style={{ textAlign: 'center' }}><Link to="/spel">Ga naar de Escape Room</Link></p>
		<Image src={OfficeOverview} />
		<p>De Escape Room is gericht op scholieren uit de onderbouw van de middelbare school die wel houden van raadsels, getallen, en een beetje uitdaging. Zit jij dit lesjaar in klas 1, 2 of 3 van het voortgezet onderwijs? En lukt het je om de Escape Room voor 13 juni 2025 op te lossen? Dan win je mogelijk een gratis plek voor een <Link to="https://www.vierkantvoorwiskunde.nl/">Vierkant voor Wiskunde</Link> zomerkamp! Zie de <Link to="/info">Infopagina</Link> voor details en voorwaarden.</p>
	</Subpage>
}

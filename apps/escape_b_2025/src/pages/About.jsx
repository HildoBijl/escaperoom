import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Subpage } from 'components'

export function About() {
	// Set up tester activation system.
	const [, setTesterCount] = useState(0)
	const testerHandler = () => {
		setTesterCount(count => {
			if (count > 4)
				localStorage.setItem('tester', 'on')
			return count + 1
		})
	}

	// Set up admin activation system.
	const [, setAdminCount] = useState(0)
	const adminHandler = () => {
		setAdminCount(count => {
			if (count > 9)
				localStorage.setItem('adminmode', 'on')
			return count + 1
		})
	}

	return <Subpage>
		<p>Hier vind je informatie over waar deze Escape Room vandaan komt.</p>
		<h2 onClick={() => testerHandler()}>Achtergrond</h2>
		<p>Stichting <Link to="https://www.vierkantvoorwiskunde.nl/">Vierkant voor Wiskunde</Link> organiseert al vanaf 1993 wiskundige activiteiten voor jongeren. Onder andere organiseert de stichting elk jaar wiskundezomerkampen voor groep 6 tot en met klas 6. Om dit mooie initiatief te ondersteunen, hebben de <Link to="https://www.vierkantvoorwiskunde.nl/2023/10/uitbouw-van-de-vierkant-voor-wiskunde-zomerkampen/">bèta-vicedecanen van de Nederlandse universiteiten</Link> in 2024 een bijdrage toegekend om de zomerkampen uit te breiden.</p>
		<p>Je hoeft geen wiskundeheld te zijn om mee te gaan op kamp, maar wel een liefhebber van puzzels en problemen. Tijdens de kampen wordt een aantal onderwerpen met een wiskundig thema verkend, zoals veelvlakken, getallen, grafen, magische vierkanten, geheimschrift of verzamelingen. Je kunt ook aan de slag gaan met berekeningen, bouwwerken, tekeningen of kunstwerken gebaseerd op een nieuw uitdagend onderwerp. Hierbij kun je denken aan Escher-tekeningen of fractals. Naast de wiskunde is er natuurlijk ook tijd voor andere activiteiten, zoals sport, spelletjes, zwemmen en creatieve activiteiten. Er zijn twee deskundige begeleiders per groepje van 6 deelnemers, zodat iedereen voldoende meegenomen en uitgedaagd wordt.</p>
		<p>Deze Escape Room is in 2024-2025 opgezet als prijsvraag om twintig gratis kampplaatsen weg te geven. De prijsvraag is inmiddels gesloten en de winnaars zijn op de hoogte gesteld van hun prijs. Je kunt niet meer meedoen voor de prijzen. Wel kun je de Escape Room oplossen en je naam toevoegen aan de <Link to="/leaderboard">lijst van oplossers</Link>.</p>
		<p>Wil je alsnog mee op een van de zomerkampen van Vierkant voor Wiskunde? Meer informatie vind je op de website:<br /><Link to="https://www.vierkantvoorwiskunde.nl/kampen/">https://www.vierkantvoorwiskunde.nl/kampen/</Link></p>
		<h2>Makers</h2>
		<p>Deze Escape Room is gemaakt door:</p>
		<ul>
			<li>Raadsels: Rianne Florijn</li>
			<li>Verhaal: Hildo Bijl</li>
			<li onClick={() => adminHandler()}>Programmering: Hildo Bijl</li>
		</ul>
		<p>Afbeeldingen zijn gegenereerd via <Link to="https://deepai.org/">DeepAI</Link>.</p>
		<p>In geval van bugs kun je deze melden via <a href="mailto:info@hildobijl.com">info@hildobijl.com</a>.</p>
	</Subpage>
}

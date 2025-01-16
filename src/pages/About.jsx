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
		<p>Hier vind je informatie over de achtergrond van deze Escape Room web-app, inclusief de actievoorwaarden rondom de prijzen.</p>
		<h2>Achtergrond en prijzen</h2>
		<p>Stichting <Link to="https://www.vierkantvoorwiskunde.nl/">Vierkant voor Wiskunde</Link> organiseert al vanaf 1993 wiskundige activiteiten voor jongeren. Onder andere organiseert de stichting elk jaar wiskundezomerkampen voor groep 6 tot en met klas 6. Om dit mooie initiatief te ondersteunen, hebben de <Link to="https://www.vierkantvoorwiskunde.nl/2023/10/uitbouw-van-de-vierkant-voor-wiskunde-zomerkampen/">bèta-vicedecanen van de Nederlandse universiteiten</Link> een bijdrage toegekend om de zomerkampen uit te breiden.</p>
		<p>Je hoeft geen wiskundeheld te zijn om mee te gaan op kamp, maar wel een liefhebber van puzzels en problemen. Tijdens de kampen wordt een aantal onderwerpen met een wiskundig thema verkend, zoals veelvlakken, getallen, grafen, magische vierkanten, geheimschrift of verzamelingen. Je kunt ook aan de slag gaan met berekeningen, bouwwerken, tekeningen of kunstwerken gebaseerd op een nieuw uitdagend onderwerp. Hierbij kun je denken aan Escher-tekeningen of fractals. Naast de wiskunde is er natuurlijk ook tijd voor andere activiteiten, zoals sport, spelletjes, zwemmen en creatieve activiteiten. Er zijn twee deskundige begeleiders per groepje van 6 deelnemers, zodat iedereen voldoende meegenomen en uitgedaagd wordt.</p>
		<p>Zin om mee te gaan op kamp? Om kennis te maken met onze kampen geven we twintig gratis kampplaatsen ter waarde van €355 weg. Doe mee aan deze Escape Room en loot mee voor één van de twintig gratis plaatsen! Kun jij alle raadsels oplossen en uit de Escape Room ontsnappen? Dan is een Vierkant-zomerkamp zeker wat voor jou!</p>
		<p>Meer informatie over de zomerkampen vind je op de website van Vierkant voor Wiskunde:<br /><Link to="https://www.vierkantvoorwiskunde.nl/kampen/">https://www.vierkantvoorwiskunde.nl/kampen/</Link></p>
		<h2 onClick={() => testerHandler()}>Actievoorwaarden en tijdslijn</h2>
		<p>De Escape Room is gericht op enthousiaste scholieren uit de onderbouw van de middelbare school. Voor hen zijn er in 2025 twee kampen (kampen Bx en By) met elk maximaal zestig plaatsen. Er worden in totaal twintig gratis plaatsen verloot onder de oplossers van de Escape Room.</p>
		<p>Om in aanmerking te komen voor één van de twintig gratis plaatsen, moet je voldoen aan de volgende voorwaarden.</p>
		<ul>
			<li>Je zit in schooljaar 2024/2025 in klas 1, 2 of 3 van het voortgezet onderwijs.</li>
			<li>Je bent nog niet eerder op een zomerkamp van Vierkant voor Wiskunde meegeweest.</li>
			<li>Je bent beschikbaar om aan één van de kampen (Bx: 21 t/m 25 juli 2025, By: 11 t/m 15 augustus 2025) deel te nemen.</li>
		</ul>
		<p>Voldoe je niet aan deze voorwaarden? Dan mag je uiteraard nog steeds de Escape Room oplossen, maar je komt niet in aanmerking voor de prijzen.</p>
		<p>Om een prijs te winnen moet je uiterlijk <strong>13 juni 2025</strong> de Escape Room opgelost hebben en je gegevens achterlaten. Na deze datum trekt Vierkant voor Wiskunde uit de lijst van oplossers (na een controle op geldigheid/dubbelen) willekeurig twintig winnaars. Deze winnaars worden dan uitgenodigd voor een gratis plek op het zomerkamp.</p>
		<p>Zit je bij de winnaars? Dan ontvang je uiterlijk 20 juni 2025 bericht. Over de loting kan niet gecorrespondeerd worden.</p>
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

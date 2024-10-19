import { Image } from 'components'
import { Office as OfficeImage, OfficeDoor } from 'assets'

export function Office({ numVisits, direction, action }) {
	// On the first visit, show the game intro.
	if (numVisits === 1) {
		return <>
			<p>Tijdens een lange wiskundeles vertel je aan je wiskundedocent dat je wel eens wat andere wiskunde wilt dan de standaard wiskunde van de middelbare school. Je docent krijgt een klein fonkelen in de ogen en neemt je mee naar zijn kantoor achterin het klaslokaal. Uit een grote boekenkast trekt hij een boek over fractals.</p>
			<Image src={OfficeImage} />
			<p>Terwijl de docent terug gaat naar het klaslokaal, ga je zitten in de stoel achter zijn bureau en duik je in de ingewikkelde figuren. Gefascineerd in de patronen vergeet je totaal de tijd. Als je uiteindelijk uit het boek ontwaakt merk je dat het rumoer van het klaslokaal opgehouden is. Een kille stilte lijkt door het gebouw getrokken te zijn. Hoe lang was je wel niet aan het lezen?</p>
			<p>Je staat op, loopt naar de deur terug naar het klaslokaal en grijpt de deurkruk. De ijzige kou die door je hand gaat geeft je al een vermoeden, en als je de deurkruk omlaag trekt en aan de deur sjort weet je het zeker: hij is in het slot gevallen. En nu?</p>
			<Image src={OfficeDoor} />
			<p>Tot je verbazing heeft de deur geen sleutelgat of soortgelijk. De deur is gekoppeld aan een klein kastje. Als je het kastje opent vind je een touch screen. Is dit een nieuw soort beveiligingssysteem?</p>
		</>
	}

	return <>
		<p>Je bent in het kantoor. {numVisits}:{direction}:{action}</p>
		{action ? <p>{action}</p> : <p>Wat ga je doen?</p>}
	</>
}

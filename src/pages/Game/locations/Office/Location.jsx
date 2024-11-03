import { Image } from 'components'
import { OfficeOverview } from 'assets'

import { cases } from '../../util'
import { ResetButton } from '../../components'

export function Location({ numVisits, clearHistory }) {
	// On the first visit, show the game intro. On later visits, show a shorter message.
	return cases(numVisits, [0, 3, Infinity], [
		<>
			<ResetButton {...{ clearHistory }} />
			<p>Tijdens een lange wiskundeles vertel je aan je wiskundedocent dat je wel eens wat andere wiskunde wilt dan de standaard wiskunde van de middelbare school. Je docent krijgt een klein fonkelen in de ogen en neemt je mee naar het kantoor achterin het klaslokaal. Uit een grote boekenkast wordt een boek over fractals tevoorschijn gehaald.</p>
			<Image src={OfficeOverview} />
			<p>Terwijl de docent terug gaat naar het klaslokaal, ga je zitten in de stoel achter het grote bureau en duik je in de ingewikkelde figuren. Gefascineerd in de patronen vergeet je totaal de tijd. Als je uiteindelijk uit het boek ontwaakt merk je dat het rumoer van het klaslokaal opgehouden is. Een kille stilte lijkt door het gebouw getrokken te zijn. Hoe lang was je wel niet aan het lezen?</p>
		</>,
		<p>Je bent weer terug in het kantoor. Er is niets veranderd sinds de laatste keer dat je er was.</p>,
		<p>Je keert alweer terug naar het kantoor. Er is hier werkelijk niets te vinden, maar om onbekende reden vind je het gewoon prettig om te doen alsof jij nu zelf de wiskundedocent bent, en dus blijf je hier terugkeren.</p>,
	])
}

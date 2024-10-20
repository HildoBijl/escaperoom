import { Image } from 'components'
import { Office as OfficeImage, OfficeDoor } from 'assets'

import { getNumActionVisits } from '../engine'
import { ResetButton, ChoiceButtons, Line } from '../components'

export function Location({ numVisits, clearHistory }) {
	// On the first visit, show the game intro.
	if (numVisits === 0) {
		return <>
			<ResetButton {...{ clearHistory }} />
			<p>Tijdens een lange wiskundeles vertel je aan je wiskundedocent dat je wel eens wat andere wiskunde wilt dan de standaard wiskunde van de middelbare school. Je docent krijgt een klein fonkelen in de ogen en neemt je mee naar het kantoor achterin het klaslokaal. Uit een grote boekenkast wordt een boek over fractals tevoorschijn gehaald.</p>
			<Image src={OfficeImage} />
			<p>Terwijl de docent terug gaat naar het klaslokaal, ga je zitten in de stoel achter het grote bureau en duik je in de ingewikkelde figuren. Gefascineerd in de patronen vergeet je totaal de tijd. Als je uiteindelijk uit het boek ontwaakt merk je dat het rumoer van het klaslokaal opgehouden is. Een kille stilte lijkt door het gebouw getrokken te zijn. Hoe lang was je wel niet aan het lezen?</p>
		</>
	}

	// On future visits, show a shorter message.
	return <>
		<p>Je bent weer terug in het kantoor. Er is niets veranderd sinds de laatste keer dat je er was.</p>
	</>
}

export function Action(props) {
	const { action, numActionVisits, isCurrentAction } = props
	switch (action.type) {
		case 'search':
			return <>
				<Line text="Je doorzoekt het kantoor" />
				{numActionVisits === 0 ? <p>Er liggen talloze notities verstrooid rond het bureau. Ergens aan de rand van het bureau vind je eentje die je opvalt. Het is een stuk papier met getallen erop in een bepaald patroon. (ToDo: voeg afbeelding toe van voorbeeld magisch raam.)</p> :
					numActionVisits < 4 ? <p>Je gaat nogmaals het kantoor door, maar vindt niets wat je nog niet eerder gezien hebt.</p> : <p>Je doorzoekt nogmaals hopeloos voor de zoveelste keer het kantoor, maar er is werkelijk niets nieuws te vinden.</p>}
			</>
		case 'checkDoor':
			return <>
				<Line text="Je probeert de deur te openen" />
				<p>Je staat op, loopt naar de deur terug naar het klaslokaal en grijpt de deurkruk. De ijzige kou die door je hand gaat geeft je al een vermoeden, en als je de deurkruk omlaag trekt en aan de deur sjort weet je het zeker: hij is in het slot gevallen. En nu?</p>
				<Image src={OfficeDoor} />
				<p>Tot je verbazing heeft de deur geen sleutelgat of soortgelijk. De deur is gekoppeld aan een klein kastje. Als je het kastje opent vind je een touch screen. Is dit een nieuw soort beveiligingssysteem?</p>
			</>
		case 'checkBox':
			return <>
				<Line text="Je bekijkt het scherm in het kastje naast de deur" />
				{numActionVisits === 0 ? <>
					<p>Je ziet op het scherm een vierkant patroon van vakjes. Elk van de vakjes heeft een getal erin, als een soort code. Toch lijkt de code nog niet correct te zijn.</p>
					{isCurrentAction ? <Interface {...props} /> : null}
				</> : <>
					<p>Hetzelfde patroon van getallen is nog steeds zichtbaar.</p>
					{isCurrentAction ? <Interface {...props} /> : null}
				</>}
			</>
		case 'return':
			return <>
				<Line text="Je gaat terug naar het kantoor" />
				<p>Je laat het kastje voorlopig met rust, doet een stap terug, en kijkt weer rond in het kantoor.</p>
			</>
		case 'unlockDoor':
			return <>
				<Line text="Je lost het magische raam op en de deur klikt open" />
				<p>Eindelijk! Je dacht even dat je tot de volgende dag vast zou zitten in het kantoor. De deur laat zich nu normaal openen, en je stapt terug het wiskundelokaal in.</p>
			</>
		default:
			throw new Error(`Invalid action type: cannot determine what to do with an action of type "${action.type}" at the current location.`)
	}
}

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions({ state, lastAction, history, locationIndex, actionIndex }) {
	if (lastAction?.type === 'checkBox')
		return [{ text: 'Ga terug naar het kantoor', action: 'return' }]
	if (state.officeDoorOpened)
		return [{ text: 'Ga naar het wiskundelokaal', action: { type: 'move', to: 'Maths' } }]
	const neverCheckedDoor = !getNumActionVisits(history, 'Office', 'checkDoor', locationIndex, actionIndex)
	return [
		{ text: 'Doorzoek het kantoor', action: 'search' },
		neverCheckedDoor ?
			{ text: 'Open de deur terug naar het klaslokaal', action: 'checkDoor' } :
			{ text: 'Bekijk het scherm in het kastje naast de deur', action: 'checkBox' },
	]
}

function Interface(props) {
	const { submitAction } = props
	return <p>ToDo: zet interface op om raadseloplossing in te geven. Tot de interface klaar is kun je <span onClick={() => submitAction('unlockDoor')} style={{ fontWeight: 'bold', cursor: 'pointer' }}>hier</span> klikken om direct het raadsel op te lossen en de deur te openen.</p>
}

import { Image } from 'components'
import { Office as OfficeImage, OfficeDoor } from 'assets'

import { cases, isAdmin, useRiddleStorage } from '../util'
import { ResetButton, ChoiceButtons, Line, Svg } from '../components'

export function Location({ numVisits, clearHistory }) {
	// On the first visit, show the game intro. On later visits, show a shorter message.
	return cases(numVisits, [0, 3, Infinity], [
		<>
			<ResetButton {...{ clearHistory }} />
			<p>Tijdens een lange wiskundeles vertel je aan je wiskundedocent dat je wel eens wat andere wiskunde wilt dan de standaard wiskunde van de middelbare school. Je docent krijgt een klein fonkelen in de ogen en neemt je mee naar het kantoor achterin het klaslokaal. Uit een grote boekenkast wordt een boek over fractals tevoorschijn gehaald.</p>
			<Image src={OfficeImage} />
			<p>Terwijl de docent terug gaat naar het klaslokaal, ga je zitten in de stoel achter het grote bureau en duik je in de ingewikkelde figuren. Gefascineerd in de patronen vergeet je totaal de tijd. Als je uiteindelijk uit het boek ontwaakt merk je dat het rumoer van het klaslokaal opgehouden is. Een kille stilte lijkt door het gebouw getrokken te zijn. Hoe lang was je wel niet aan het lezen?</p>
		</>,
		<p>Je bent weer terug in het kantoor. Er is niets veranderd sinds de laatste keer dat je er was.</p>,
		<p>Je keert alweer terug naar het kantoor. Er is hier werkelijk niets te vinden, maar om onbekende reden vind je het gewoon prettig om te doen alsof jij nu zelf de wiskundedocent bent, en dus blijf je hier terugkeren.</p>,
	])
}

export function Action(props) {
	const { action, numActionVisits, isCurrentAction } = props
	switch (action.type) {
		case 'search':
			return <>
				<Line text="Je doorzoekt het kantoor" />
				{cases(numActionVisits, [0, 2, Infinity], [
					<p>Er liggen talloze notities verstrooid rond het bureau. Ergens aan de rand van het bureau vind je eentje die je opvalt. Het is een stuk papier met getallen erop in een bepaald patroon. (ToDo: voeg afbeelding toe van voorbeeld magisch raam.)</p>,
					<p>Je gaat nogmaals het kantoor door, maar vindt niets wat je nog niet eerder gezien hebt.</p>,
					<p>Je doorzoekt nogmaals hopeloos voor de zoveelste keer het kantoor, maar er is werkelijk niets nieuws te vinden.</p>,
				])}
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
				{cases(numActionVisits, [0, 2, Infinity], [
					<p>Je ziet op het scherm een vierkant patroon van vakjes. Elk van de vakjes heeft een getal erin, als een soort code. Toch lijkt de code nog niet correct te zijn.</p>,
					<p>Hetzelfde patroon van getallen is nog steeds zichtbaar.</p>,
					<p>De getallen zijn er nog steeds. Ze lijken je voor de gek te houden. Zul je ooit hun betekenis snappen?</p>,
				])}
				{isCurrentAction ? <Interface {...props} /> : null}
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
		case 'move':
			return <Line text="Je gaat naar het wiskundelokaal" />
		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location.`)
	}
}

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions({ state, lastAction }) {
	if (lastAction?.type === 'checkBox')
		return [{ text: 'Ga terug naar het kantoor', action: 'return' }, isAdmin() ? { text: 'Admin mode: los raadsel op', action: 'unlockDoor' } : undefined]
	return [
		{ text: 'Doorzoek het kantoor', action: 'search' },
		!state.officeDoor?.checked ?
			{ text: 'Open de deur terug naar het klaslokaal', action: 'checkDoor' } :
			!state.officeDoor?.unlocked ?
				{ text: 'Bekijk het scherm in het kastje naast de deur', action: 'checkBox' } :
				{ text: 'Ga naar het wiskundelokaal', action: { type: 'move', to: 'Maths' } },
	]
}

// Set up settings for the Interface.
const initialNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1]
const size = 72
const margin = 36
const gap = 24
const radius = 10
const numToX = num => margin + size / 2 + numToCol(num) * (size + gap)
const numToY = num => margin + size / 2 + numToRow(num) * (size + gap)
const numToRow = num => [0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 2, 1][num]
const numToCol = num => [0, 1, 2, 3, 3, 3, 3, 2, 1, 0, 0, 0][num]

const marginLong = 24
const marginShort = 10
const containerParameters = { rx: radius, ry: radius, stroke: '#800', strokeWidth: 6, style: { opacity: 1, fill: 'none' } }

// Render the interface.
function Interface({ state }) {
	const seed = state.officeDoor.seed
	const [numbers, setNumbers, clearNumbers] = useRiddleStorage('officeDoor', initialNumbers)
	return <Svg size={4 * size + 3 * gap + 2 * margin} style={{ borderRadius: '1rem' }}>
		<rect x={margin - marginShort} y={margin - marginLong} width={size + 2 * marginShort} height={4 * size + 3 * gap + 2 * marginLong} {...containerParameters} />
		<rect x={margin + 3 * (size + gap) - marginShort} y={margin - marginLong} width={size + 2 * marginShort} height={4 * size + 3 * gap + 2 * marginLong} {...containerParameters} />
		<rect x={margin - marginLong} y={margin - marginShort} width={4 * size + 3 * gap + 2 * marginLong} height={size + 2 * marginShort} rx={radius} {...containerParameters} />
		<rect x={margin - marginLong} y={margin + 3 * (size + gap) - marginShort} width={4 * size + 3 * gap + 2 * marginLong} height={size + 2 * marginShort} {...containerParameters} />

		{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, index) => <rect key={index} x={numToX(num) - size / 2} y={numToY(num) - size / 2} width={size} height={size} rx={radius} ry={radius} fill="blue" />)}

		<text x={(4 * size + 3 * gap + 2 * margin)/2} y={(4 * size + 3 * gap + 2 * margin)/2} fill="#eee" style={{ fontSize: '100px', textAnchor: 'middle', dominantBaseline: 'middle' }}>{seed}</text>
	</Svg>
}

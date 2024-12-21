import { Image } from 'components'
import { OfficeDoor, OfficeHint, FactorialHint } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

import { Interface } from './Interface'

export function Action(props) {
	const { location, action, numActionVisits, isCurrentAction, nextAction } = props
	switch (action.type) {
		case 'search':
			return <Line text="Je doorzoekt het bureau">
				{cases(numActionVisits, [0, 2, Infinity], [
					<>
						<p>Er liggen talloze notities verstrooid rond het bureau. Ergens aan de rand van vind je eentje die je opvalt. Het is een stuk papier met getallen erop in een bepaald patroon.</p>
						<Image src={OfficeHint} />
					</>,
					<p>Je gaat nogmaals de notities op het bureau door, maar vindt niets wat je nog niet eerder gezien hebt.</p>,
					<p>Je doorzoekt nogmaals hopeloos voor de zoveelste keer het bureau, maar er is werkelijk niets nieuws te vinden.</p>,
				])}
			</Line>
		case 'lookAround':
			return <Line text="Je kijkt rond in het kantoor">
				{cases(numActionVisits, [0, 2, 3, 5, 6, Infinity], [
					<>
						<p>Tussen alle stoffige boekenkasten (wordt hier nooit schoongemaakt?) wordt je aandacht getrokken door een wat spacy poster. Blijkbaar ziet je wiskundedocent graag wiskunde in een mooi ruimte-thema. Het is een uitleg over de faculteit: door een uitroepteken achter een getal te zetten krijg je een vermenigvuldiging.</p>
						<Image src={FactorialHint} />
					</>,
					<p>Je kijkt nogmaals het kantoor rond, maar het enige wat dit oplevert is een extra hoestbui van al het stof in de boekenkasten.</p>,
					<>
						<p>Je kijkt nog een keer naar de poster over faculteiten. Het grote uitroepteken aan de rechterkant ziet er wel vreemd uit. Hij is veel te hoekig voor een poster die voor de rest een prima layout heeft. Is daar een reden voor? Betekent het iets?</p>
						<Image src={FactorialHint} />
					</>,
					<p>Je doorzoekt weer het kantoor, maar er is nog steeds niets nieuws te vinden.</p>,
					<p>In een hoek van het lokaal vind je tot je verrassing een plumeau! Zat van al het stof besluit je de kamer eens goed af te stoffen. Na een paar minuten werk ziet het er al een stuk beter uit.</p>,
					<p>Er is niets nieuws te vinden in het kantoor, maar hij is tenminste wel mooi schoon.</p>,
				])}
			</Line>
		case 'checkDoor':
			return <Line text="Je probeert de deur te openen">
				<p>Je staat op, loopt naar de deur terug naar het klaslokaal en grijpt de deurkruk. De ijzige kou die door je hand gaat geeft je al een vermoeden, en als je de deurkruk omlaag trekt en aan de deur sjort weet je het zeker: hij is in het slot gevallen. En nu?</p>
				<Image src={OfficeDoor} />
				<p>Tot je verbazing heeft de deur geen sleutelgat of soortgelijk. De deur is gekoppeld aan een klein kastje. Als je het kastje opent vind je een touch screen. Is dit een nieuw soort beveiligingssysteem?</p>
			</Line>
		case 'checkBox':
			return <Line text="Je bekijkt het scherm naast de deur">
				{cases(numActionVisits, [0, 2, Infinity], [
					<p>Je ziet op het scherm een vierkant patroon van vakjes. Elk van de vakjes heeft een getal erin, als een soort code. Toch lijkt de code nog niet correct te zijn.</p>,
					<p>Hetzelfde patroon van getallen is nog steeds zichtbaar.</p>,
					<p>De getallen zijn er nog steeds. Ze lijken je voor de gek te houden. Zul je ooit hun betekenis snappen?</p>,
				])}
				{isCurrentAction || nextAction?.type === 'unlockDoor' ? <Interface {...props} /> : null}
			</Line>
		case 'return':
			return <Line text="Je gaat terug naar het kantoor">
				<p>Je laat het kastje voorlopig met rust, doet een stap terug, en staat weer middenin het kantoor.</p>
			</Line>
		case 'unlockDoor':
			return null // Next room.
		case 'move':
			return null
		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location "${location}".`)
	}
}

import { Image } from 'components'
import { MusicHint, MusicHintAfter, MusicDoor, CypherKey } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

import { Interface } from './Interface'

export function Action(props) {
	const { location, action, numActionVisits, isCurrentAction, nextAction } = props
	switch (action.type) {
		case 'move':
			switch (action.to) {
				case 'Maths':
					return <Line text="Je gaat naar het wiskundelokaal" />
				case 'Art':
					return <Line text="Je gaat naar het kunstlokaal" />
				case 'Hallway':
					return <Line text="Je gaat via de gang naar de aula" />
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'checkBlackboard':
			return <>
				<Line text="Je bekijkt het schoolbord" />
				{cases(numActionVisits, [0, 2, 3, 4, Infinity], [
					<>
						<p>Het schoolbord is volgeklad met allemaal muziektermen. Blijkbaar ging het over de basistoonladders: Do Re Mi Fa Sol La Ti Do. Je hebt dat ooit ook eens geleerd ergens.</p>
						<Image src={MusicHint} />
					</>,
					<p>Er is niets verandert met het schoolbord. Dezelfde vreemde scribbles staan er nog steeds op.</p>,
					<p>De kleine toevoeging rechtsonder op het schoolbord valt je op. Iets met ongelijkheid? Alle letters moeten ongelijk aan elkaar zijn? Wat zou het betekenen?</p>,
					<>
						<p>De chaos op het schoolbord begint je te frustreren. Je pakt de wisser en veegt het bord grondig schoon. Zo, allemaal leeg. Dit is veel netter.</p>
						<Image src={MusicHintAfter} />
					</>,
					<p>Er is niets meer te zien op het schoolbord. Mogelijk had je het toch niet uit moeten vegen? Gelukkig heb je nog een aardig idee van wat er zojuist op stond.</p>,
				])}
			</>

		case 'search':
			return <>
				<Line text="Je doorzoekt het muzieklokaal" />
				{cases(numActionVisits, [0, 2, 3, Infinity], [
					<>
						<p>De meeste tafels zijn leeg, maar op een tafel in de hoek van het klaslokaal heeft iemand een opgevouwen propje papier achtergelaten. Je vouwt het uit en ziet een paar willekeurige scribbles. Erg creatief, maar het ziet er meer uit als een kunstproject dan iets dat in het muzieklokaal hoort. Om het lokaal netjes te houden, stop je het blad papier maar in je broekzak.</p>
						<Image src={CypherKey} />
					</>,
					<p>Nu het propje papier opgeruimd is, zijn alle tafels verder leeg.</p>,
					<p>De tafels in het lokaal zijn nog steeds leeg, maar het doet je wel denken aan het propje papier dat je hier eerder gevonden had, dat nog in je broekzak zit. Je haalt hem eruit en bekijkt hem nog eens. Het is een patroon van vierkantjes, sommigen recht en sommigen gedraaid, en elk met een letter of cijfer erin. Ook de grote stip onderin valt je op. Is dat een willekeurige inktvlek, of heeft die een betekenis?</p>,
					<p>De tafels in het muzieklokaal staan nog steeds allemaal netjes in rijtjes naar het schoolbord gericht. Ze zijn allemaal leeg.</p>,
				])}
			</>

		case 'checkDoor':
			switch (action.to) {
				case 'Hallway':
					return <>
						<Line text="Je bekijkt de deur naar de gang" />
						{cases(numActionVisits, [0, 2, Infinity], [
							<p>Je probeert het klaslokaal op de normale manier te verlaten, maar de deur naar de gang is op slot. Tja, het was te verwachten. Werkelijk alles is hermetisch afgesloten.</p>,
							<p>In een vlaag van verstandsverbijstering probeer je de deur die op slot zich nogmaals te openen. Hij is nog steeds op slot.</p>,
							<p>Je slaat je hoofd tegen de deur aan. Het heeft geen effect op de deur: die blijft dicht. Je krijgt er wel hoofdpijn van.</p>,
						])}
					</>
				case 'Art':
					return <>
						<Line text="Je bekijkt de deur naar het kunstlokaal" />
						{cases(numActionVisits, [0, 2, 3, Infinity], [
							<>
								<p>Wat krijgen we nou, deze deur heeft geen elektronisch kastje ernaast. Het is een oud hangslot! Dat moet het een stuk makkelijker maken. Het hangslot heeft vier draaischijven, allen boven elkaar, met de cijfers 0 tot en met 9.</p>
								<Image src={MusicDoor} />
								<p>Naast het slot heeft iemand een post-it geplakt. Erop staat de meest onzinnige vraag die iemand ooit gesteld heeft, &quot;Hoeveel is DRIE?&quot; Je haalt je schouders op en probeert het slot los te krijgen.</p>
							</>,
							<p>Het hangslot houdt de deur nog steeds goed gesloten.</p>,
							<p>Het hangslot hangt nog steeds naast de post-it. Wat je opvalt is dat &quot;DRIE&quot; met hoofdletters geschreven is. Vier hoofdletters naast elkaar. En het slot heeft ook vier draaischijven. Is dat toeval?</p>,
							<p>Het slot heeft nog steeds niet de juiste code.</p>,
						])}
						{isCurrentAction || nextAction?.type === 'unlockDoor' ? <Interface {...props} /> : null}
					</>
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'unlockDoor':
			return <>
				<Line text="Je voert de juiste code in" />
				<p>Met het draaien van het laatste wiel klikt het hangslot open. Je grijpt de deurklink en opent de deur.</p>
			</>

		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location "${location}".`)
	}
}
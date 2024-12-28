import { Image } from 'components'
import { LanguageHint, DutchInterface } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

import { Interface } from './Interface'

export function Action(props) {
	const { state, location, action, numActionVisits, isCurrentAction, nextAction } = props
	switch (action.type) {
		case 'move':
			switch (action.to) {
				case 'History':
					return null
				case 'Hallway':
					return null
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'checkDesk':
			return <Line text="Je doorzoekt het bureau">
				{cases(numActionVisits, [0, 2, 3, Infinity], [
					<>
						<p>Op het bureau ligt, tussen een stapel nog na te kijken huiswerk, een blad papier in een taal die je nog nooit gezien hebt.</p>
						<Image src={LanguageHint} />
						<p>Je weet dat ze in andere landen met andere symbolen schrijven, maar uit welk land komt dit? En wat voor dringende vraag had die persoon dan wel niet?</p>
					</>,
					<p>Er ligt alleen nog maar ingeleverd huiswerk op het bureau van de docent. Je hebt geen zin om Franse woordjes na te gaan kijken.</p>,
					<p>Je kijkt de boodschap in de vreemde taal, die je eerder gevonden had, nog eens goed door. Misschien is elk teken een letter? Maar hoe weet je welk teken welke letter is? Is er ergens een ontsleuteling te vinden?</p>,
					<p>Er is geen nieuwe info meer te vinden op het bureau van de docent.</p>,
				])}
			</Line>

		case 'checkDoor':
			return <Line text="Je bekijkt de deur naar de gang">
				{cases(numActionVisits, [0, 1, 2, Infinity], [
					<p>Misschien zijn ze deze deur vergeten op slot te doen? Je probeert met je laatste beetje hoop de deurklink. Helaas, ook deze zit dicht.</p>,
					<p>Je probeert nog eens goed aan de deur te trekken, maar er komt nog steeds geen beweging in.</p>,
					<p>Je bedenkt je dat je in het taalkundelokaal bent. Misschien reageert de deur op taal? Luid zeg je, &quot; Sesam, open!&quot; Helaas, er gebeurt niets. Nogmaal roep je, &quot;Open!&quot; Niets... Misschien moet het in een andere taal? Je probeert het via een Engelse &quot;Open!&quot; en een Duitse &quot;Öffnen!&quot; maar niets verandert. Misschien een andere taal ofzo? Of is dit simpelweg een wanhoopspoging?</p>,
					<p>Je zoekt in de talloze woordenboeken van het lokaal nogmaals het woord &quot;open&quot; in een nieuwe taal op, en spreekt het luid naar de deur uit, maar het heeft helaas geen effect.</p>,
				])}
			</Line>

		case 'checkBox':
			return <Line text="Je bekijkt het elektronische kastje">
				{cases(numActionVisits, [0, 2, 3, Infinity], [
					<>
						<p>Je opent het kleine kastje met de kabels die eruit lopen. Deze keer zit er geen fancy touchscreen in, maar slechts een klein schermpje met vier vreemde tekens. Boven en onder het display staan knopjes.</p>
						<Image src={DutchInterface} />
						<p>Je bekijkt de vreemde tekens op het scherm. Heb je die al ergens anders gezien?</p>
					</>,
					<p>Je vraagt je af wat de vreemde figuren betekenen. Misschien kun je het op de een of andere manier ontcijferen?</p>,
					<p>Inmiddels heb je een aardig idee van wat de vreemde figuren betekenen. Maar hoe weet je wat de juiste code is? Door welke cijfers moet een getal deelbaar zijn? En hoeveel keer kun je ze dan door die getallen delen?</p>,
					<p>Je probeert wanhopig de symbolen te veranderen naar een nieuwe combinatie, maar er gebeurt nog steeds weinig.</p>,
				])}
				{isCurrentAction || nextAction?.type === 'unlockDoor' ? <Interface {...props} /> : null}
			</Line>

		case 'unlockDoor':
			return <Line text="Het kastje geeft een luide piep">
				{state.hall1Unlocked ? <>
					<p>De vier symbolen op het kleine schermpje verdwijnen. Terwijl het scherm luid piept, verschijnt er een zwevende boodschap op het scherm, &apos;Gebouwvergredenling opgeheven.&apos; Vervolgens hoor je een harde klik naast je, ergens in de deur. Dat belooft wat! Je kijkt uit naar je aankomende vrijheid.</p>
				</> : <>
					<p>De vier symbolen op het kleine schermpje verdwijnen. Terwijl het scherm luid piept, verschijnt er een zwevende boodschap op het scherm, &apos;Gebouwvergrendeling opheffen: stap één van de twee voltooid.&apos; De eerste stap? Je moet nog verder? Je slaakt een diepe zucht en haalt je schouders op. Het is in ieder geval een mooie stap vooruit. Maar wat nu?</p>
				</>}
			</Line>

		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location "${location}".`)
	}
}

import { Image } from 'components'
import { KeyPainting, ArtInterface } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

import { Interface } from './Interface'

export function Action(props) {
	const { state, location, action, numActionVisits, isCurrentAction, nextAction } = props
	switch (action.type) {
		case 'move':
			switch (action.to) {
				case 'Music':
					return null
				case 'Hallway':
					return null
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'checkPaintings':
			return <Line text="Je bekijkt de schilderijen">
				{cases(numActionVisits, [0, 2, 3, Infinity], [
					<>
						<p>Naast het zelfportret van de docent staat een schilderij van de lelijkste sleutel die je ooit gezien hebt. Een sleutel zou voor jou wel handig zijn om uit het lokaal te komen, maar je betwijfelt of een sleutel zoals deze ooit een deur kan openen.</p>
						<Image src={KeyPainting} />
					</>,
					<p>Er is niets veranderd aan de schilderijen: naast het zelfportret van de docent staat nog steeds een schilderij van een sleutel.</p>,
					<p>Je kijkt nog eens naar het schilderij van de sleutel. Waarom is het zo&apos;n hoekige sleutel? Je dacht eerst dat het aan de beperkte schildervaardigheden van de kunstenaar lag, maar mogelijk is er een reden voor?</p>,
					<p>Het zelfportret van de docent en het schilderij van de sleutel staan nog rustig naast elkaar op hun ezels.</p>,
				])}
			</Line>

		case 'checkDoor':
			return <Line text="Je bekijkt de deur naar de gang">
				{cases(numActionVisits, [0, 2, 3, Infinity], [
					<p>Tegen beter weten in probeer je ook hier de deur naar de gang, maar helaas. Hij zit op slot.</p>,
					<p>Je trekt en duwt hard aan de deur naar de gang, maar er is geen beweging in te krijgen.</p>,
					<p>De deur gaat nog steeds niet open. Maarja, als je de deur niet als deur gebruiken kan, dan misschien als kunstwerk? Je grijpt wat tubes verf en wat kwasten en gaat helemaal los. Even later is er een waar Picasso op de deur verschenen. Prachtig! Maar zelfs met de nieuwe look zit er nog steeds geen beweging in de deur.</p>,
					<p>Je bewondert je prachtige kunstwerk. Nu maar hopen dat de docent er net zo blij mee is, en je niet laat nablijven hiervoor.</p>,
				])}
			</Line>

		case 'checkBox':
			return <Line text="Je bekijkt het elektronische kastje">
				{cases(numActionVisits, [0, 1, 2, 3, 4, Infinity], [
					<>
						<p>Het kleine kastje is weinig meer dan een simpele touchscreen. Verschillende ingewikkelde geometrische figuren dansen erop rond.</p>
						<Image src={ArtInterface} />
						<p>Zodra je het touchscreen aanraakt, komen alle dansende figuren samen in een groot vierkant. Blijkbaar moet je iets ermee doen.</p>
					</>,
					<p>De figuren op het touchscreen staan er nog onveranderd bij. Was er maar ergens een sleutel om dit kastje te ontgrendelen.</p>,
					<p>Je kijkt wederom naar de figuren. Wat betekenen die drie lampjes bovenin het scherm? Heb je drie sleutels nodig? Of andere vormen?</p>,
					<p>Inmiddels ben je erachter dat er meerdere vormen nodig zijn. Maar waar kun je die vinden? Die sneaky wiskundedocent van je zit hier vast achter. Had hij maar ergens een hint achtergelaten... Misschien in zijn kantoor?</p>,
					<p>Na twee sleutels gevonden te hebben, ben je in de war over de derde. Misschien heeft iemand die ergens getekend ofzo? Je besluit nog eens goed rond te kijken naar alle plekken waar je geweest bent.</p>,
					<p>Het elektronische kastje heeft nog steeds rode lampjes. Je lijkt nog niet klaar te zijn.</p>,
				])}
				{isCurrentAction || nextAction?.type === 'unlockDoor' ? <Interface {...props} /> : null}
			</Line>

		case 'unlockDoor':
			return <Line text="De drie groene lampjes branden">
				{state.hall2Unlocked ? <>
					<p>Bij het invoeren van de derde vorm wordt het derde lampje groen. Kort verschijnt er een boodschap op het scherm, &apos;Gebouwvergredenling opgeheven.&apos; Vervolgens hoor je een harde klik naast je, ergens in de deur. Dat belooft wat! Je kijkt uit naar je aankomende vrijheid.</p>
				</> : <>
					<p>Bij het invoeren van de derde vorm wordt het derde lampje groen. Vervolgens hoor je een piepje uit het scherm komen, en kort verschijnt er een melding, &apos;Gebouwvergrendeling opheffen: stap één van de twee voltooid.&apos; De eerste stap? Je moet nog verder? Je slaakt een diepe zucht en haalt je schouders op. Het is in ieder geval een mooie stap vooruit. Maar wat nu?</p>
				</>}
			</Line>

		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location "${location}".`)
	}
}

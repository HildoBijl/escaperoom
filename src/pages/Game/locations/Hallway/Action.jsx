import { Image } from 'components'
import { HallDoor } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

import { Interface } from './Interface'

export function Action(props) {
	const { state, location, action, numActionVisits, isCurrentAction, nextAction } = props
	switch (action.type) {
		case 'move':
			switch (action.to) {
				case 'Maths':
					return null
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'checkDoor':
			return <Line text="Je bekijkt de deur naar buiten">
				{cases(numActionVisits, [0, 2, 3, Infinity], [
					<>
						<p>De grote deuren naar buiten zitten op slot met een groot hangslot. Er lijkt een evengrote sleutel voor nodig te zijn, die je uiteraard niet tot je beschikking hebt.</p>
						<Image src={HallDoor} />
					</>,
					<p>De deur naar buiten is nog steeds op slot.</p>,
					<p>Je overweegt weer hard op de deur naar buiten te bonken met je vuisten, maar je houdt je in. Het lijkt je dat je nu wel bij de laatste puzzel aangeland bent. Dan moet je dit toch ook lukken!</p>,
					<p>De deur zit nog steeds vast op slot.</p>,
				])}
			</Line>

		case 'checkTables':
			return <Line text="Je klimt op de tafels">
				{cases(numActionVisits, [0, 2, 3, Infinity], [
					<p>Je klimt op de set tafels in het midden van de hal en loopt naar de groene bureaustoel toe. Het is een groot en zwaar gevaarte, maar met z&apos;n grote wielen lijkt hij wel erg goed te kunnen rollen. Wat moet je ermee doen? Kun je hem een zetje geven ofzo? Of valt hij dan van de tafel af?</p>,
					<p>Je klimt weer op de tafels in de hal en loopt rond de groene bureaustoel.</p>,
					<p>Je klautert alweer op de tafels en blijft staan op de grote groene tafel in het midden. Waarvoor is hij? Kun je de groene stoel hier krijgen? Maar hoe dan? Is het mogelijk om een andere stoel neer te zetten zodat de groene stoel niet doorschiet?</p>,
					<p>Je blijft maar met de stoelen schuiven. Is er misschien toch een manier om de groene stoel in het midden te krijgen?</p>,
				])}
				{isCurrentAction || nextAction?.type === 'solveRiddle' ? <Interface {...props} /> : null}
			</Line>

		case 'gatherChairs':
			return <Line text="Je verzamelt meer bureaustoelen">
				<p>Je doet een rondje langs de zes ruimtes die je tot nu toe bezocht hebt, en neemt uit elk van de ruimtes de bureaustoel mee. Je sleept ze allemaal stuk voor stuk naar de aula en tilt ze op de grote tafels. Zodra je de zesde toegevoegd hebt, bewegen de bureaustoelen schijnbaar uit zichzelf naar een tafel toe. Oké, dat was blijkbaar de bedoeling?</p>
			</Line>

		case 'solveRiddle':
			return <Line text="Je brengt de groene stoel naar het midden">
				{cases(state.hallRiddlesSolved, [1, 2, Infinity], [
					<p>Je hoort een luide klik. Er moet iets gebeurd of veranderd zijn, maar wat? Na enige seconden bewegen alle stoelen, als uit zichzelf, naar een heel andere tafel. Wat krijgen we nou? Moet je het nog een keer oplossen?</p>,
					<p>Er is nog een luide klik hoorbaar. Wederom vliegen alle stoelen uit zichzelf naar een nieuwe plek op het grote levende speelbord. Je blijft bezig zo. Dit moet toch wel de laatste zijn?</p>,
					<p>Er is wederom een luide klik te horen, en tot je verbazing zinkt de groene tafel met de bureaustoel in de vloer van de aula, als een grote lift. Even later komt alles weer naar boven, met het enige verschil dat je wiskundeleraar nu in de stoel zit. Dus daar is dat stuk ongebeuren!</p>,
				])}
				{(isCurrentAction || nextAction?.type === 'solveRiddle') && state.hallRiddlesSolved < 3 ? <Interface {...props} /> : null}
			</Line>

		case 'pushChair':
			return <Line text="Je geeft de bureaustoel een harde zet">
				<p>&quot;Hé, wacht!&quot; roept je docent voordat de stoel soepel rollend in de verte verdwijnt. Met een luid gekletter stort de stoel van de tafels af, maar net op tijd weet de docent eraf te springen. &quot;Dat was niet cool. Maar vooruit, misschien heb ik het verdiend.&quot;</p>
			</Line>

		case 'talk':
			return <Line text="Je vraagt wat er aan de hand is">
				<p>&quot;Wat er aan de hand is?&quot; herhaalt de docent. &quot;Ooh, niet veel meer dan een nieuw soort test. De standaard vorm van toetsen is immers ook maar zo saai. Dus kwam ik met dit nieuwe plan.&quot;</p>
				<p>&quot;Dus dit was allemaal een test?&quot; vraag je met een opgetrokken wenkbrauw.</p>
				<p>&quot;Zie het als een uitdaging,&quot; lacht de docent. &quot;Je gaf aan dat je wel wat meer uitdagendere en vooral andere wiskunde wilde als dat standaard op school gegeven wordt. Er is een plek waar veel van dit soort wiskunde gedaan wordt: de Vierkant voor Wiskunde zomerkampen! Maar om extra te checken of je daar wel goed bij past, heb ik een serie raadsels in elkaar gezet. Je bent er met vlag en wimpel doorheen gegaan! Vandaar dat ik denk dat zo&apos;n zomerkamp zeker wat voor jou kan zijn.&quot;</p>
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

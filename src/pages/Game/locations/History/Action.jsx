import { Image } from 'components'
import { HistoryDoor, FractionHint2 } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

import { Interface } from './Interface'

export function Action(props) {
	const { location, action, numActionVisits, isCurrentAction, nextAction } = props
	switch (action.type) {
		case 'move':
			switch (action.to) {
				case 'Maths':
					return null
				case 'Dutch':
					return null
				case 'Hallway':
					return null
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'checkBlackboard':
			return <Line text="Je bekijkt het schoolbord">
				{cases(numActionVisits, [0, 2, 3, Infinity], [
					<>
						<p>Het valt je nu pas voor het eerst op dat ze in geschiedenis een whiteboard hebben! Hoezo heeft het meest ouderwetse onderwerp de meest moderne uitrusting? Je hebt geen idee.</p>
						<Image src={FractionHint2} />
						<p>Maar modern is ook relatief. Dit whiteboard ziet er uit als dat het betere jaren heeft gehad. Aan de achtergebleven krabbels te zien was er zojuist een les over Egyptische hierogliefen. Helaas heb jij die module nog niet gehad. Je hebt geen idee waar het over gaat.</p>
					</>,
					<p>De hierogliefen staan nog steeds op het whiteboard. En nog steeds heb je geen idee hoe oud Egyptisch werkt.</p>,
					<p>Je bekijkt het schoolbord nog eens. Tot je verbazing merk je tussen de onbekende hierogliefen wel een plus en een is-teken op. Hoe kan dat? Deden de oude Egyptenaren ook aan wiskunde? Tja, het zal wel. Je wiskundedocent zegt immers de hele tijd dat wiskunde overal is.</p>,
					<p>De oud-Egyptische sommen staren je nog steeds aan. Langzaam begin je het gevoel te krijgen dat je ze ook al ergens eerder gezien hebt. Of is dat simpelweg een deja-vu-gevoel dat je hebt omdat je te lang naar de sommen gekeken hebt?</p>,
				])}
			</Line>

		case 'checkDoor':
			switch (action.to) {
				case 'Hallway':
					return <Line text="Je bekijkt de deur naar de gang">
						{cases(numActionVisits, [0, 2, Infinity], [
							<p>Haast instinctief loop je naar de deur naar de gang, zoals je al talloze keren gedaan hebt. Maar helaas, hij is nog dicht.</p>,
							<p>De deur naar de gang zit nog steeds op slot. Er is geen beweging in te krijgen.</p>,
							<p>Je slaat met je vuisten op de deur naar de gang. Luid schreeuw je, &apos;Laat me eruit!&apos; Niemand hoort je. Wel doet je eigen performance je erg denken aan die ontvoeringsfilm die je afgelopen week gezien hebt. De acteur daar deed precies hetzelfde. Mogelijk moet je acteur worden?</p>,
						])}
					</Line>
				case 'Dutch':
					return <Line text="Je bekijkt de deur naar het taalkundelokaal">
						{cases(numActionVisits, [0, 2, 3, Infinity], [
							<>
								<p>Net als alle andere deuren heeft de deur naar het taalkundelokaal een klein elektronisch kastje.</p>
								<Image src={HistoryDoor} />
								<p>Je bekijkt het touchscreen en vindt een grote hoop hyrogliefen, allemaal netjes gerangschikt. Wat moet je ermee?</p>
							</>,
							<p>De hyrogliefen staan nog steeds netjes in het patroon. Ook staan de plussen en de is-tekens mooi afgewisseld tussen de lege velden. Zijn dit sommen om op te lossen?</p>,
							<p>Je vraagt je nog steeds af wat de hyrogliefen precies inhouden. Misschien moet je toch wat oud-Egyptische wiskunde leren. Is er niet ergens een voorbeeld van wat het allemaal zou kunnen betekenen?</p>,
							<p>De rode lampjes op het scherm staren je nog steeds aan. Er is blijkbaar nog meer te doen.</p>,
						])}
						{isCurrentAction || nextAction?.type === 'unlockDoor' ? <Interface {...props} /> : null}
					</Line>
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'unlockDoor':
			return null

		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location "${location}".`)
	}
}

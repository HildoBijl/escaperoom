import { Image } from 'components'
import { UnavailableDoor, MathsDoor1 } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

import { Interface as Interface1 } from './Interface1'

export function Action(props) {
	const { action, numActionVisits, isCurrentAction, nextAction } = props
	switch (action.type) {
		case 'move':
			switch (action.to) {
				case 'Office':
					return <Line text="Je stapt terug in het kantoor" />
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location.`)
			}
		case 'checkDoor': {
			switch (action.to) {
				case 'Hallway':
					return <>
						<Line text="Je bekijkt de deur naar de gang" />
						{cases(numActionVisits, [0, 2, Infinity], [
							<p>In de hoop gewoon naar buiten te kunnen lopen grijp je de deurklink en trek je aan de deur. Zoals je al vreeste is er geen beweging in te krijgen. Hij zit op slot. Je bent zo vaak door deze deur gelopen, maar dan was hij altijd gewoon open. Je volgde simpelweg de rest van je klas. Maar die optie is er nu helaas niet. Misschien is er nog een andere uitgang?</p>,
							<p>Je probeert nog eens of de deur wel echt op slot zit, maar dat zit hij zeker. Er is hoe dan ook geen beweging in te krijgen.</p>,
							<p>Je beukt met je vuisten op de deur en schreeuwt luid &quot;Laat me eruit!&quot; Helaas word je wanhoopskreis beantwoord door een ijzige stilte. Er is niemand in de buurt die je kan helpen.</p>,
						])}
					</>

				case 'History':
					return <>
						<Line text="Je loopt naar de deur naar het geschiedenislokaal" />
						{cases(numActionVisits, [0, 2, Infinity], [
							<>
								<p>Je wist altijd al dat deze tussendeur er was, maar niemand gebruikt hem ooit. Misschien is hij open? Je probeert de deurklink, maar helaas. Hij zit op slot.</p>
								<Image src={MathsDoor1} />
								<p>Je aandacht wordt wederom gegrepen door een klein kastje aan de muur. Wat voor vreemd beveiligingssysteem is dit? Het scherm toont een tabel van cijfers. Moet je iets van een pincode invoeren? Het lijkt je sterk, want er zijn wel 64 cijfers te zien. Maar wat dan wel?</p>
							</>,
							<p>De deur is nog steeds op slot. Je moet blijkbaar de juiste getallen activeren. Maar welke zijn de juiste? Misschien is er in het lokaal meer over te vinden.</p>,
							<p>Het patroon van getallen zwemt inmiddels voor je ogen. In gedachten delen de getallen zich voor je op. Maar welke getallen kunnen slechts op één manier opgesplitst worden? Je probeert wat uit, hopend op een reactie van het apparaat.</p>,
						])}
						{isCurrentAction || nextAction?.type === 'unlockDoor' ? <Interface1 {...props} /> : null}
					</>

				case 'Music':
					return <>
						<Line text="Je loopt naar de deur naar het muzieklokaal" />
						{cases(numActionVisits, [0, 2, 3, Infinity], [
							<>
								<p>Je probeert de deur naar muziek te openen, maar niet onverwacht zit hij dicht. Dus bekijk je het elektronische kastje ernaast. Helaas staat er een groot rood kruis op het scherm met een boodschap &quot;Deze deur is nog in ontwikkeling. Kom later terug.&quot;</p>
								<Image src={UnavailableDoor} />
							</>,
							<p>Helaas ... de deur is nog steeds niet toegevoegd aan de Escape Room. Het rode kruis is nog steeds zichtbaar op het scherm.</p>,
							<p>Nog steeds is er een rood kruis zichtbaar op het scherm, maar deze keer hoor je bij het grijpen van de deurklink opeens een stem over de schoolluidspreker. &quot;Beste Escape Room tester. Enorm bedankt dat je de kamer test! We waarderen het zeer. Maar hoe vaak je ook naar de deur loopt, hij is nog steeds niet beschikbaar. Ga simpelweg naar huis en kom een paar dagen later terug. (Ja, vraag me niet hoe, als je in de school opgesloten zit.)&quot;</p>,
							<p>Je loopt nog een keer naar de deur toe in de hoop de stem over de luidspreker weer te horen, maar helaas. Het blijft stil.</p>,
						])}
					</>
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location.`)
			}
		}
		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location.`)
	}
}
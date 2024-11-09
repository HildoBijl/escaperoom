import { Image } from 'components'
import { UnavailableDoor, MathsHint1, MathsDoor1 } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

import { Interface as Interface1 } from './Interface1'

export function Action(props) {
	const { location, action, numActionVisits, isCurrentAction, nextAction } = props
	switch (action.type) {
		case 'move':
			switch (action.to) {
				case 'Office':
					return <Line text="Je stapt terug in het kantoor" />
				case 'Music':
					return <Line text="Je gaat naar het muzieklokaal" />
				case 'History':
					return <Line text="Je gaat naar het geschiedenislokaal" />
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'checkPosters':
			return <>
				<Line text="Je bekijkt de posters aan de muur" />
				{cases(numActionVisits, [0, 2, 3, Infinity], [
					<>
						<p>Er hangen talloze posters aan de muur, en hoewel je in een verveelde bui de meesten wel eens aangestaard hebt, heb je er nog nooit echt over nagedacht wat ze nou eigenlijk tonen. Vooral een grote poster met drie getallen trekt je aandacht. Wat betekent het?</p>
						<Image src={MathsHint1} />
					</>,
					<p>Je bekijkt de posters nog een keer, maar er is niets nieuws dat je opvalt.</p>,
					<p>Gefrustreerd trek je een poster van de muur af. Erachter is een stuk muur zichtbaar dat in twintig jaar waarschijnlijk geen daglicht gezien heeft. Het biedt je alleen weinig extra uitgangen: de muur ziet er net zo hard uit als in de rest van het lokaal. Hopelijk wordt de leraar niet boos op je omdat je z&apos;n poster gesloopt hebt.</p>,
					<p>De posters staren met grote ogen terug. Je besluit ze nu maar te laten hangen. Je hebt er al genoeg kapot gemaakt vandaag.</p>,
				])}
			</>

		case 'checkDoor':
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
								<p>Je kan je niet herinneren dat iemand deze tussendeur ooit gebruikt heeft. Maar is hij open? Je probeert de deurklink. Helaas, hij zit op slot.</p>
								<Image src={MathsDoor1} />
								<p>Je kijkt naar het kastje naast de muur. Wat voor vreemd beveiligingssysteem is dit? Het scherm toont een groot tabel van cijfers. Moet je iets van een pincode invoeren? Het lijkt je sterk, want er zijn wel 64 cijfers te zien. Maar wat dan wel?</p>
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
								<p>Je probeert de deur naar het muzieklokaal te openen, maar niet onverwacht zit hij dicht. Dus bekijk je het elektronische kastje ernaast. Helaas staat er een groot rood kruis op het scherm met een boodschap &quot;Deze deur is nog in ontwikkeling. Kom later terug.&quot;</p>
								<Image src={UnavailableDoor} />
							</>,
							<p>Helaas ... de deur is nog steeds niet toegevoegd aan de Escape Room. Het rode kruis is nog steeds zichtbaar op het scherm.</p>,
							<p>Nog steeds is er een rood kruis zichtbaar op het scherm, maar deze keer hoor je bij het grijpen van de deurklink opeens een stem over de schoolluidspreker. &quot;Beste Escape Room tester. Enorm bedankt dat je de kamer test! We waarderen het zeer. Maar hoe vaak je ook naar de deur loopt, hij is nog steeds niet beschikbaar. Ga simpelweg naar huis en kom een paar dagen later terug. (Ja, vraag me niet hoe, als je in de school opgesloten zit.)&quot;</p>,
							<p>Je loopt nog een keer naar de deur toe in de hoop de stem over de luidspreker weer te horen, maar helaas. Het blijft stil.</p>,
						])}
					</>
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'unlockDoor':
			switch (action.to) {
				case 'History':
					return <>
						<Line text="Je lost het getallenrooster op" />
						<p>Met het laatste groene blok dat verschijnt volgt een bekende klik. De deur gaat voor je open, en je kan via de tussendeur het vertrouwde geschiedenislokaal in.</p>
					</>
				case 'Music':
					return <>
						<Line text="Je lost het ToDo raadsel op" />
						<p>Je gebruikt je magische admin-krachten en de deur zwaait open!</p>
					</>
				default:
					throw new Error(`Invalid action to parameter: cannot determine what to render for an action of type "${action.type}" at the current location "${location}" due to an unknown to-value "${action.to}".`)
			}
			
		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location "${location}".`)
	}
}

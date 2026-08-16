import { Image } from 'components'
import { MathsHint1, MathsDoor1, MathsDoor2, FractionHint } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

import { Interface as Interface1 } from './Interface1'
import { Interface as Interface2 } from './Interface2'

export function Action(props) {
	const { location, action, numActionVisits, isCurrentAction, nextAction } = props
	switch (action.type) {
		case 'move':
			switch (action.to) {
				case 'Office':
					return null
				case 'Music':
					return null
				case 'History':
					return null
				case 'Hallway':
					return null
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'checkPosters':
			return <Line text="Je bekijkt de posters aan de muur">
				{cases(numActionVisits, [0, 2, 3, Infinity], [
					<>
						<p>Er hangen talloze posters aan de muur, en hoewel je in een verveelde bui de meesten wel eens aangestaard hebt, heb je er nog nooit echt over nagedacht wat ze nou eigenlijk tonen. Vooral een grote poster met drie getallen trekt je aandacht. Wat betekent het?</p>
						<Image src={MathsHint1} />
					</>,
					<p>Je bekijkt de posters nog een keer, maar er is niets nieuws dat je opvalt.</p>,
					<p>Gefrustreerd trek je een poster van de muur af. Erachter is een stuk muur zichtbaar dat in twintig jaar waarschijnlijk geen daglicht gezien heeft. Het biedt je alleen weinig extra uitgangen: de muur ziet er net zo hard uit als in de rest van het lokaal. Hopelijk wordt de leraar niet boos op je omdat je z&apos;n poster gesloopt hebt.</p>,
					<p>De resterende posters staren met grote ogen terug. Je besluit ze nu maar te laten hangen. Je hebt er al genoeg kapot gemaakt vandaag.</p>,
				])}
			</Line>

		case 'checkBlackboard':
			return <Line text="Je bekijkt het schoolbord">
				{cases(numActionVisits, [0, 2, 3, Infinity], [
					<>
						<p>Er staat nog een tweetal sommen met breuken op het schoolbord. Dat is vreemd, de les die je zojuist had ging helemaal niet over breuken! Je haalt je schouders op. Het zal wel niets betekenen.</p>
						<Image src={FractionHint} />
					</>,
					<p>Je bekijkt het schoolbord nog eens, maar er is niets veranderd. De twee breukensommen staan er nog steeds op.</p>,
					<p>Je bekijkt de twee vergelijkingen op het schoolbord nog eens. Een derde plus een kwart is gelijk aan een half plus een twaalfde? Na wat rekenen zie je in dat het inderdaad klopt. Grappig dat meerdere breukensommen zo op hetzelfde uit kunnen komen. Je vraagt je af hoe men hier ooit achter gekomen is. En hoe lang weet men dit al? Misschien heeft het geschiedenislokaal hier meer info over.</p>,
					<p>Het schoolbord heeft nog steeds dezelfde vergelijkingen. De getallen beginnen inmiddels langzaam voor je ogen te dansen.</p>,
				])}
			</Line>

		case 'checkDoor':
			switch (action.to) {
				case 'Hallway':
					return <Line text="Je bekijkt de deur naar de gang">
						{cases(numActionVisits, [0, 2, Infinity], [
							<p>In de hoop gewoon naar buiten te kunnen lopen grijp je de deurklink en trek je aan de deur. Zoals je al vreeste is er geen beweging in te krijgen. Hij zit op slot. Je bent zo vaak door deze deur gelopen, maar dan was hij altijd gewoon open. Je volgde simpelweg de rest van je klas. Maar die optie is er nu helaas niet. Misschien is er nog een andere uitgang?</p>,
							<p>Je probeert nog eens of de deur wel echt op slot zit, maar dat zit hij zeker. Er is hoe dan ook geen beweging in te krijgen.</p>,
							<p>Je beukt met je vuisten op de deur en schreeuwt luid &quot;Laat me eruit!&quot; Helaas word je wanhoopskreis beantwoord door een ijzige stilte. Er is niemand in de buurt die je kan helpen.</p>,
						])}
					</Line>
				case 'History':
					return <Line text="Je loopt naar de deur naar het geschiedenislokaal">
						{cases(numActionVisits, [0, 1, 2, 3, 4, Infinity], [
							<>
								<p>Je kan je niet herinneren dat iemand deze tussendeur ooit gebruikt heeft. Maar is hij open? Je probeert de deurklink. Helaas, hij zit op slot.</p>
								<Image src={MathsDoor1} />
								<p>Je kijkt naar het kastje naast de muur. Wat voor vreemd beveiligingssysteem is dit? Het scherm toont een groot tabel van getallen. Moet je iets van een pincode invoeren? Het lijkt je sterk, want er zijn wel 64 getallen te zien. Maar wat dan wel?</p>
							</>,
							<p>De deur is nog steeds op slot. Je moet blijkbaar de juiste getallen activeren. Maar welke zijn de juiste? Misschien is er in het lokaal meer over te vinden.</p>,
							<p>Het patroon van getallen zwemt inmiddels voor je ogen. In gedachten delen de getallen zich voor je op. Maar welke getallen kunnen slechts op één manier opgesplitst worden? Je probeert wat uit, vooral bij de kleine getallen, hopend op een reactie van het apparaat.</p>,
							<p>Je kijkt weer naar het rooster van getallen. Er staat je iets bij van priemfactoren. Kun je de priemfactoren van een getal vinden? En wat moet ervoor gelden?</p>,
							<p>Je duikt weer het getalrooster in. Deze keer vraag je je af hoe het werkt met kwadraten en driemachten van priemgetallen. Werkt het daar hetzelfde? Of toch net anders? Hoe zit dat met 2, 4 en 8? Of 3, 9 en 27?</p>,
							<p>Je blijft maar proberen getallen aan te vinken in het getallenrooster. Uiteindelijk moet er toch iets gebeuren?</p>,
						])}
						{isCurrentAction || nextAction?.type === 'unlockDoor' ? <Interface1 {...props} /> : null}
					</Line>
				case 'Music':
					return <Line text="Je loopt naar de deur naar het muzieklokaal">
						{cases(numActionVisits, [0, 1, 2, 3, Infinity], [
							<>
								<p>Je hebt nooit echt op deze tussendeur gelet. Hopelijk is hij open? Je grijpt de deurklink en trekt hem omlaag, maar de deur gaat geen kant op.</p>
								<Image src={MathsDoor2} />
								<p>Boven de deur hangen drie lampen, die je nu pas voor het eerst opmerkt, en ook is er weer zo&apos;n elektronisch kastje. Het scherm toont verschillende combinaties van cijfers, waarbij sommigen ook oranje of groene lampjes ernaast hebben. Wat betekent het?</p>
							</>,
							<p>De getallencodes op het scherm staren je nog steeds aan. Welke code moet je invoeren zodat de deur open gaat?</p>,
							<p>Je kijkt nog eens goed naar de lampjes naast de cijfers. Is dat een soort feedback? Dat slechts een deel van de code klopt? Wat zou een oranje lampje kunnen betekenen? En welke code zou dan drie groene lampjes geven?</p>,
							<p>Je vraagt je nog steeds af wat de lampjes precies betekenen. Wat voor een <em>mastermind</em> heeft dit bedacht?</p>,
							<p>De vijf foute codes op het scherm staren je nog steeds aan. Wat is de juiste code?</p>,
						])}
						{isCurrentAction || nextAction?.type === 'unlockDoor' ? <Interface2 {...props} /> : null}
					</Line>
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'unlockDoor':
			switch (action.to) {
				case 'History':
					return null
				case 'Music':
					return null
				default:
					throw new Error(`Invalid action to parameter: cannot determine what to render for an action of type "${action.type}" at the current location "${location}" due to an unknown to-value "${action.to}".`)
			}

		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location "${location}".`)
	}
}

import { Image } from 'components'
import { DutchRoom } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

export function Location({ numVisits }) {
	return <Line text={numVisits === 0 ? 'Je vindt de laatste breukencombinatie' : 'Je gaat naar het taalkundelokaal'}>
		{cases(numVisits, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, Infinity], [
			<>
				<p>Het zesde groene lampje gaat aan en je slaakt een zucht van verlichting. Dat zit erop. De deur gaat open en je kan verder naar het taalkundelokaal.</p>
				<p>In dit lokaal worden alle taalvakken gegeven, van Nederlands tot Frans en van Duits tot Spaans. De talloze boekenkasten met woordenboeken en leesboeken in alle talen staan nog netjes langs de wand.</p>
				<Image src={DutchRoom} />
				<p>Achterin het lokaal, naast het bureau van de docent, is de deur naar de gang. In de hoek van het lokaal is ook weer een elektronisch kastje met vast weer een touchscreen erin. Je blijft je afvragen hoe je die kastjes nooit eerder opgemerkt hebt.</p>
			</>,
			<p>Je bent weer terug in het taalkundelokaal. Het ziet er net zo uit als voorheen. Je begint de woordenboeken van de verschillende talen een beetje door te pluizen.</p>,
			<p>You are back in the language classroom. It looks the same as before.</p>,
			<p>Du bist zurück im Klassenzimmer für Sprachunterricht. Es sieht genauso aus wie vorher.</p>,
			<p>Tu es de retour dans la salle de classe de langues. Elle ressemble à ce qu&apos;elle était avant.</p>,
			<p>Has vuelto al aula de lengua y literatura. Está igual que antes.</p>,
			<p>Du är tillbaka i klassrummet för språkundervisning. Det ser ut precis som tidigare.</p>,
			<p>Επιστρέψατε στην τάξη των γλωσσικών τεχνών. Φαίνεται ακριβώς όπως πριν.</p>,
			<p>Вы вернулись в класс языковых искусств. Он выглядит так же, как и раньше.</p>,
			<p>لقد عدت إلى فصل فنون اللغة. يبدو الأمر كما كان عليه من قبل.</p>,
			<p>你们又回到了语文课堂。这里看起来和以前一样。</p>,
			<p>Je bent weer in het taalkundelokaal, maar laat deze keer de woordenboeken maar liggen. Alle talen beginnen je een beetje te duizelen.</p>,
		])}
	</Line>
}

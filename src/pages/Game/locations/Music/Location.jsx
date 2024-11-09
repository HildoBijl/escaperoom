import { Image } from 'components'
import { MusicRoom, BrokenPiano } from 'assets'

import { cases } from '../../util'

export function Location({ numVisits }) {
	return cases(numVisits, [0, 2, 3, 6, 7, Infinity], [
		<>
			<p>Terwijl je het muzieklokaal binnenloopt, kun je in gedachten haast de muziekstukken horen die de docent hier altijd met de klas speelt. Maar als je rondkijkt, valt je de ijzige stilte op die in de ruimte heerst. Er is niemand aanwezig om überhaupt muziek te maken.</p>
			<Image src={MusicRoom} />
			<p>Er is weinig vreemds te zien in het muzieklokaal. De piano staat nog steeds naast het raam. De gitaren hangen nog aan de muur. De deur naar de gang staat op de gebruikelijke plek, maar die zal vast op slot zijn. En achterin het lokaal, naast de deur naar informatica, hangt het volgekladde schoolbord nog steeds aan de muur.</p>
		</>,
		<p>Er is weinig veranderd in het muzieklokaal. Je tikt rustig enkele gitaren aan en hoort het galmen van de snaren door het lokaal.</p>,
		<p>Je denkt, &quot;Wat als er ergens een geheime geluidsdetector in is gebouwd?&quot; en neemt plaats achter de piano. Na een rustige intro ga je helemaal los en speel je de meest weergaloze voorstelling van Vivaldi&apos;s vier jaargetijden die ooit gespeeld is. Maar helaas is er niemand om het te horen, en je zit nog steeds opgesloten in de school. Tja, wat nu?</p>,
		<p>De stilte in het bekende muzieklokaal begint op je in te werken. Je wilt naar buiten.</p>,
		<>
			<p>De stilte in het muzieklokaal wordt je te veel. Je trekt een gitaar van de muur en slaat hem vol op de piano aan stukken. De piano galmt luid en de klankkast van de gitaar vliegt aan stukken. Met de stok van de gitaar nog in je handen haal je nog een paar keer vol uit op de piano. Verschillende toetsen vliegen door het lokaal. Uiteindelijk houdt het galmen van de snaren op, en de ijsige stilte is weer teruggekeerd in het lokaal. Alleen piano spelen zit er nu niet meer in. Misschien was dit toch niet zo&apos;n goed idee.</p>
			<Image src={BrokenPiano} />
		</>,
		<p>Het muzieklokaal is nog steeds een puinhoop. Je vraagt je af hoeveel een nieuwe piano zou kosten.</p>,
	])
}

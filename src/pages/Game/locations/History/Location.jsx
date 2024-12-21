import { Image } from 'components'
import { HistoryRoom } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

export function Location({ numVisits }) {
	return <Line text={numVisits === 0 ? 'Je lost het getallenrooster op' : 'Je gaat naar het geschiedenislokaal'}>
		{cases(numVisits, [0, 2, 3, Infinity], [
			<>
				<p>Met het laatste groene blok dat verschijnt volgt een luide klik. De deur gaat voor je open, en je kan via de tussendeur het vertrouwde geschiedenislokaal in.</p>
				<p>Zoals gewoonlijk als je het lokaal binnenstapt, merk je op dat het er net zo oud ruikt als de lesstof die er behandeld wordt. Gelukkig is het lokaal wel netjes. Alle tafels staan mooi in een rijtje, de historische posters hangen aan de wand, en het bureau van de docent is leeg.</p>
				<Image src={HistoryRoom} />
				<p>Je ogen gaan wederom uit naar de deuren. Aan de ene kant is er de deur naar de gang, waar je normaliter door naar binnen komt. Verderop is er een tussendeur naar het taalkundelokaal.</p>
			</>,
			<p>Het geschiedenislokaal is nog net zo netjes als voorheen. Als het zo brandschoon is, hoe ruikt het lokaal dan toch altijd zo oud?</p>,
			<p>Je keert terug in het geschiedenislokaal. De geur begint je nu wel echt de nek uit te komen. Weet je wat dit lokaal nodig heeft? Een beetje frisse lucht! Je loopt naar de set ramen achterin het lokaal en gooit alles zo veel mogelijk open. Helaas gaan de ramen slechts op een kiertje - je past er zelf nooit doorheen - maar toch helpt het wat.</p>,
			<p>Een frisse wind blaast door het geschiedenislokaal. Heerlijk!</p>,
		])}
	</Line>
}

import { cases } from '../../util'
import { Line } from '../../components'

export function Location({ numVisits }) {
	return <Line text={numVisits === 0 ? 'Je lost het getallenrooster op' : 'Je gaat naar het geschiedenislokaal'}>
		{cases(numVisits, [0, 3, Infinity], [
			<>
				<p>Met het laatste groene blok dat verschijnt volgt een luide klik. De deur gaat voor je open, en je kan via de tussendeur het vertrouwde geschiedenislokaal in.</p>
				<p>Je bent nu in het geschiedenislokaal. Helaas is dit lokaal nog in ontwikkeling. Hij komt er zo snel mogelijk aan!</p>
			</>,
			<p>Het geschiedenislokaal is nog steeds in ontwikkeling. Er is nog niets veranderd.</p>,
			<p>Nog steeds is er niets veranderd in het geschiedenislokaal.</p>,
		])}
	</Line>
}

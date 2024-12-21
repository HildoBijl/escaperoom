import { cases } from '../../util'
import { Line } from '../../components'

export function Location({ numVisits }) {
	return <Line text={numVisits === 0 ? 'Je vindt de laatste breukencombinatie' : 'Je gaat naar het taalkundelokaal'}>
		{cases(numVisits, [0, Infinity], [
			<>
				<p>Het zesde groene lampje gaat aan en je slaakt een zucht van verlichting. Dat zit erop. De deur gaat open en je kan verder naar het taalkundelokaal.</p>
				<p>Je bent in het talenlokaal. Dit lokaal is nog in ontwikkeling.</p>
			</>,
			<p>Je bent alweer in het talenlokaal. Dit lokaal is nog in ontwikkeling.</p>,
		])}
	</Line>
}

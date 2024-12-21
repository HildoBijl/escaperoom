import { cases } from '../../util'
import { Line } from '../../components'

export function Location({ numVisits }) {
	return <Line text="Je gaat via de gang naar de aula">
		{cases(numVisits, [0, Infinity], [
			<p>Je loopt via de gang naar de aula. Deze ruimte is nog in ontwikkeling.</p>,
			<p>Je bent alweer via de gang in de aula beland. Deze ruimte is nog in ontwikkeling.</p>,
		])}
	</Line>
}

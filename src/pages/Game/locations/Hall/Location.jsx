import { cases } from '../../util'

export function Location({ numVisits }) {
	return cases(numVisits, [0, Infinity], [
		<p>Je loopt via de gang naar de aula. Deze ruimte is nog in ontwikkeling.</p>,
		<p>Je bent alweer via de gang in de aula beland. Deze ruimte is nog in ontwikkeling.</p>,
	])
}

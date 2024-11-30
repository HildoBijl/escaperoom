import { cases } from '../../util'

export function Location({ numVisits }) {
	return cases(numVisits, [0, Infinity], [
		<p>Je bent in het kunstlokaal. Dit lokaal is nog in ontwikkeling.</p>,
		<p>Je bent alweer in het kunstlokaal. Dit lokaal is nog in ontwikkeling.</p>,
	])
}

import { cases } from '../../util'

export function Location({ numVisits }) {
	return cases(numVisits, [0, Infinity], [
		<p>Je bent in het informaticalokaal. Dit lokaal is nog in ontwikkeling.</p>,
		<p>Je bent alweer in informatica. Dit lokaal is nog in ontwikkeling.</p>,
	])
}

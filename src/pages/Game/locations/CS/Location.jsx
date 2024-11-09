import { cases } from '../../util'

export function Location({ numVisits }) {
	return cases(numVisits, [0, Infinity], [
		<p>Je bent in het informaticalokaal.</p>,
		<p>Je bent alweer in informatica.</p>,
	])
}

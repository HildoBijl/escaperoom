import { cases } from '../../util'

export function Location({ numVisits }) {
	return cases(numVisits, [0, 3, Infinity], [
		<p>Je bent nu in het geschiedenislokaal. Helaas is dit lokaal nog in ontwikkeling. Hij komt er zo snel mogelijk aan!</p>,
		<p>Het geschiedenislokaal is nog steeds in ontwikkeling. Er is nog niets veranderd.</p>,
		<p>Nog steeds is er niets veranderd in het geschiedenislokaal.</p>,
	])
}

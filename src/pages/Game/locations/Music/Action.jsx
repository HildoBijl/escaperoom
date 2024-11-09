// import { Image } from 'components'
// import { UnavailableDoor, MathsHint1, MathsDoor1 } from 'assets'

import { cases } from '../../util'
import { Line } from '../../components'

// import { Interface as Interface1 } from './Interface1'

export function Action(props) {
	const { location, action, numActionVisits } = props
	switch (action.type) {
		case 'move':
			switch (action.to) {
				case 'Maths':
					return <Line text="Je gaat naar het wiskundelokaal" />
				case 'CS':
					return <Line text="Je gaat naar het informaticalokaal" />
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'checkBlackboard':
			return <p>Je bekijkt het schoolbord.</p>

		case 'checkDoor':
			switch (action.to) {
				case 'Hallway':
					return <>
						<Line text="Je bekijkt de deur naar de gang" />
						{cases(numActionVisits, [0, 2, Infinity], [
							<p>Je probeert het klaslokaal op de normale manier te verlaten, maar de deur naar de gang is op slot. Tja, het was te verwachten. Werkelijk alles is hermetisch afgesloten.</p>,
							<p>In een vlaag van verstandsverbijstering probeer je de deur die op slot zich nogmaals te openen. Hij is nog steeds op slot.</p>,
							<p>Je slaat je hoofd tegen de deur aan. Het heeft geen effect op de deur: die blijft dicht. Je krijgt er wel hoofdpijn van.</p>,
						])}
					</>
				case 'CS':
					return <>
						<Line text="Je bekijkt de deur naar informatica" />
						{cases(numActionVisits, [0, 2, Infinity], [
							<p>ToDo</p>,
						])}
					</>
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}

		case 'unlockDoor':
			return <>
				<Line text="Je voert de juiste code in" />
				<p>Met het draaien van het laatste wiel klikt het hangslot open. Je grijpt de deurklink en opent de deur.</p>
			</>

		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location "${location}".`)
	}
}
import { Line } from '../../components'

export function Action(props) {
	const { location, action } = props
	switch (action.type) {
		case 'move':
			switch (action.to) {
				case 'Maths':
					return <Line text="Je gaat terug naar het wiskundelokaal" />
				case 'Hallway':
					return <Line text="Je gaat via de gang naar de aula" />
				default:
					throw new Error(`Invalid ${action.type} location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location "${location}".`)
			}
		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location "${location}".`)
	}
}

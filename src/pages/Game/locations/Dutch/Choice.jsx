import { ChoiceButtons } from '../../components'

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions() {
	return [
		{ text: 'Ga terug naar het geschiedenislokaal', action: { type: 'move', to: 'History' } },
	]
}

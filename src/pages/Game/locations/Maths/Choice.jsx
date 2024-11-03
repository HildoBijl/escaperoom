import { isAdmin, isTester } from '../../util'
import { ChoiceButtons } from '../../components'

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions() {
	if (!isAdmin() && !isTester())
		return null
	return [
		{ text: 'Bekijk de deur naar de gang', action: { type: 'checkDoor', to: 'Hallway' } },
		{ text: 'Bekijk de deur naar muziek', action: { type: 'checkDoor', to: 'Music' } },
		{ text: 'Bekijk de deur naar geschiedenis', action: { type: 'checkDoor', to: 'History' } },
		{ text: 'Ga terug naar het kantoor', action: { type: 'move', to: 'Office' } },
	]
}

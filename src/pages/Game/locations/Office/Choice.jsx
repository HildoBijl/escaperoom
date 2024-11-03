import { isAdmin } from '../../util'
import { ChoiceButtons } from '../../components'

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions({ state, lastAction }) {
	if (lastAction?.type === 'checkBox')
		return [{ text: 'Ga terug naar het kantoor', action: 'return' }, isAdmin() ? { text: 'Admin mode: los raadsel op', action: 'unlockDoor' } : undefined]
	return [
		{ text: 'Doorzoek het kantoor', action: 'search' },
		!state.officeDoor?.checked ?
			{ text: 'Ga terug naar het klaslokaal', action: 'checkDoor' } :
			!state.officeDoor?.unlocked ?
				{ text: 'Bekijk het scherm naast de deur', action: 'checkBox' } :
				{ text: 'Ga naar het wiskundelokaal', action: { type: 'move', to: 'Maths' } },
	]
}
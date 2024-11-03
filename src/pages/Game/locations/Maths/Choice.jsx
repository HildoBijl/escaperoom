import { isAdmin, isTester } from '../../util'
import { ChoiceButtons } from '../../components'

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions({ state, lastAction }) {
	if (!isAdmin() && !isTester())
		return null

	if (lastAction?.type === 'checkBox')
		return [{ text: 'Ga terug naar het kantoor', action: 'return' }, isAdmin() ? { text: 'Admin mode: los raadsel op', action: 'unlockDoor' } : undefined]

	return [
		// Hallway.
		{ text: 'Bekijk de deur naar de gang', action: { type: 'checkDoor', to: 'Hallway' } },

		// Music.
		lastAction?.type === 'checkDoor' && lastAction?.to === 'Music' ? undefined : { text: 'Bekijk de deur naar muziek', action: { type: 'checkDoor', to: 'Music' } },

		// History.
		state.historyDoorUnlocked ?
			{ text: 'Ga naar het geschiedenislokaal', action: { type: 'move', to: 'History' } } :
			lastAction?.type === 'checkDoor' && lastAction?.to === 'History' ? undefined : { text: 'Bekijk de deur naar geschiedenis', action: { type: 'checkDoor', to: 'History' } },

		// Office.
		{ text: 'Ga terug naar het kantoor', action: { type: 'move', to: 'Office' } },
	]
}

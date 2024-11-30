import { isAdmin, isTester } from '../../util'
import { ChoiceButtons } from '../../components'

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions({ state, lastAction }) {
	if (!isAdmin() && !isTester())
		return null

	return [
		// Posters.
		lastAction?.type === 'checkPosters' ? undefined : { text: 'Bestudeer de posters aan de muur', action: 'checkPosters' },

		// Blackboard.
		lastAction?.type === 'checkBlackboard' ? undefined : { text: 'Bekijk het schoolbord', action: 'checkBlackboard' },

		// Hallway.
		lastAction?.type === 'checkDoor' && lastAction?.to === 'Hallway' ? undefined : { text: 'Bekijk de deur naar de gang', action: { type: 'checkDoor', to: 'Hallway' } },

		// Music.
		state.musicDoorUnlocked ? { text: 'Ga naar het muzieklokaal', action: { type: 'move', to: 'Music' } } : undefined,
		!state.musicDoorUnlocked && !(lastAction?.type === 'checkDoor' && lastAction?.to === 'Music') ? { text: 'Bekijk de deur naar muziek', action: { type: 'checkDoor', to: 'Music' } } : undefined,
		!state.musicDoorUnlocked && lastAction?.type === 'checkDoor' && lastAction?.to === 'Music' && isAdmin() ? { text: 'Admin mode: los raadsel op', action: { type: 'unlockDoor', to: 'Music' } } : undefined,

		// History.
		state.historyDoorUnlocked ?
			{ text: 'Ga naar het geschiedenislokaal', action: { type: 'move', to: 'History' } } :
			lastAction?.type === 'checkDoor' && lastAction?.to === 'History' ?
				(isAdmin() ? { text: 'Admin mode: los raadsel op', action: { type: 'unlockDoor', to: 'History' } } : undefined) :
				{ text: 'Bekijk de deur naar geschiedenis', action: { type: 'checkDoor', to: 'History' } },

		// Office.
		{ text: 'Ga terug naar het kantoor', action: { type: 'move', to: 'Office' } },
	]
}

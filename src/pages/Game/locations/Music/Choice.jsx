import { isAdmin } from '../../util'
import { ChoiceButtons } from '../../components'

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions({ state, lastAction }) {
	return [
		// Posters.
		lastAction?.type === 'checkBlackboard' ? undefined : { text: 'Bekijk het schoolbord', action: 'checkBlackboard' },

		// Search.
		lastAction?.type === 'search' ? undefined : { text: 'Doorzoek het lokaal', action: 'search' },

		// Hallway.
		!state.hall1Unlocked || !state.hall2Unlocked ? undefined : { text: 'Ga naar de aula', action: { type: 'move', to: 'Hallway' } },
		(state.hall1Unlocked && state.hall2Unlocked) || (lastAction?.type === 'checkDoor' && lastAction?.to === 'Hallway') ? undefined : { text: 'Bekijk de deur naar de gang', action: { type: 'checkDoor', to: 'Hallway' } },

		// Art.
		state.artDoorUnlocked ? { text: 'Ga naar het kunstlokaal', action: { type: 'move', to: 'Art' } } : undefined,
		!state.artDoorUnlocked && !(lastAction?.type === 'checkDoor' && lastAction?.to === 'Art') ? { text: 'Bekijk de deur naar kunst', action: { type: 'checkDoor', to: 'Art' } } : undefined,
		!state.artDoorUnlocked && lastAction?.type === 'checkDoor' && lastAction?.to === 'Art' && isAdmin() ? { text: 'Admin mode: los raadsel op', action: { type: 'unlockDoor', to: 'Art' } } : undefined,

		// Maths.
		{ text: 'Ga terug naar het wiskundelokaal', action: { type: 'move', to: 'Maths' } },
	]
}

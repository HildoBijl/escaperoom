import { isAdmin } from '../../util'
import { ChoiceButtons } from '../../components'

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions({ state, lastAction }) {
	return [
		// Blackboard.
		lastAction?.type === 'checkBlackboard' ? undefined : { text: 'Bekijk het schoolbord', action: 'checkBlackboard' },

		// Hallway.
		!state.hall1Unlocked || !state.hall2Unlocked ? undefined : { text: 'Ga naar de aula', action: { type: 'move', to: 'Hallway' } },
		(state.hall1Unlocked && state.hall2Unlocked) || (lastAction?.type === 'checkDoor' && lastAction?.to === 'Hallway') ? undefined : { text: 'Bekijk de deur naar de gang', action: { type: 'checkDoor', to: 'Hallway' } },

		// Dutch.
		state.dutchDoorUnlocked ? { text: 'Ga naar het taalkundelokaal', action: { type: 'move', to: 'Dutch' } } : undefined,
		!state.dutchDoorUnlocked && !(lastAction?.type === 'checkDoor' && lastAction?.to === 'Dutch') ? { text: 'Bekijk de deur naar het taalkundelokaal', action: { type: 'checkDoor', to: 'Dutch' } } : undefined,
		!state.dutchDoorUnlocked && lastAction?.type === 'checkDoor' && lastAction?.to === 'Dutch' && isAdmin() ? { text: 'Admin mode: los raadsel op', action: { type: 'unlockDoor', to: 'Dutch' } } : undefined,

		// Maths.
		{ text: 'Ga terug naar het wiskundelokaal', action: { type: 'move', to: 'Maths' } },
	]
}

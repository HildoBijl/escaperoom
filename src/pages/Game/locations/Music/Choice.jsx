import { isAdmin } from '../../util'
import { ChoiceButtons } from '../../components'

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions({ state, lastAction }) {
	
	return [
		// Posters.
		lastAction?.type === 'checkBlackboard' ? undefined : { text: 'Bekijk het schoolbord', action: 'checkBlackboard' },

		// Hallway.
		lastAction?.type === 'checkDoor' && lastAction?.to === 'Hallway' ? undefined : { text: 'Bekijk de deur naar de gang', action: { type: 'checkDoor', to: 'Hallway' } },

		// Computer Science.
		state.csDoorUnlocked ? { text: 'Ga naar het informaticalokaal', action: { type: 'move', to: 'CS' } } : undefined,
		!state.csDoorUnlocked && !(lastAction?.type === 'checkDoor' && lastAction?.to === 'CS') ? { text: 'Bekijk de deur naar informatica', action: { type: 'checkDoor', to: 'CS' } } : undefined,
		!state.csDoorUnlocked && lastAction?.type === 'checkDoor' && lastAction?.to === 'CS' && isAdmin() ? { text: 'Admin mode: los raadsel op', action: { type: 'unlockDoor', to: 'CS' } } : undefined,

		// Maths.
		{ text: 'Ga terug naar het wiskundelokaal', action: { type: 'move', to: 'Maths' } },
	]
}

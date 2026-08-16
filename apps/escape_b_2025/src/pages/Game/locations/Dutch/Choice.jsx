import { isAdmin } from '../../util'
import { ChoiceButtons } from '../../components'

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions({ state, lastAction }) {
	return [
		// Desk.
		lastAction?.type === 'checkDesk' ? undefined : { text: 'Bekijk het bureau van de docent', action: 'checkDesk' },

		// Hallway.
		!state.hall1Unlocked || !state.hall2Unlocked ? undefined : { text: 'Ga naar de aula', action: { type: 'move', to: 'Hallway' } },
		(state.hall1Unlocked && state.hall2Unlocked) || (lastAction?.type === 'checkDoor' && lastAction?.to === 'Hallway') ? undefined : { text: 'Bekijk de deur naar de gang', action: { type: 'checkDoor', to: 'Hallway' } },

		// Riddle.
		state.hall2Unlocked || lastAction?.type === 'checkBox' ? undefined : { text: 'Bekijk het elektronische kastje', action: 'checkBox' },
		!state.hall2Unlocked && lastAction?.type === 'checkBox' && isAdmin() ? { text: 'Admin mode: los raadsel op', action: 'unlockDoor' } : undefined,

		// History.
		{ text: 'Ga terug naar het geschiedenislokaal', action: { type: 'move', to: 'History' } },
	]
}

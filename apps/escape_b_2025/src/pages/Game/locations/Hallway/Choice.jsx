import { isAdmin } from '../../util'
import { ChoiceButtons } from '../../components'

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions({ state, lastAction }) {
	// On all done.
	if (state.allDone)
		return []

	// On all solved but not done.
	if (state.hallRiddlesSolved === 3)
		return [
			state.hallRiddlesSolved === 3 && lastAction?.type !== 'pushChair' ? { text: 'Geef de bureaustoel een zet', action: 'pushChair' } : undefined,
			state.hallRiddlesSolved === 3 ? { text: 'Praat met de wiskundedocent', action: 'talk' } : undefined,
		]

	// On regular visit.
	return [
		// Desk.
		lastAction?.type === 'checkDoor' ? undefined : { text: 'Bekijk de deur naar buiten', action: 'checkDoor' },

		// Riddle.
		state.hallRiddlesSolved === 3 || lastAction?.type === 'checkTables' ? undefined : { text: 'Bekijk de tafels van dichterbij', action: 'checkTables' },
		state.hallRiddlesSolved !== 3 && isAdmin() ? { text: 'Admin mode: los raadsel op', action: 'solveRiddle' } : undefined,

		// Get doors.
		state.chairsGathered ? undefined : { text: 'Haal meer bureaustoelen', action: 'gatherChairs' },

		// History.
		{ text: 'Ga terug naar het wiskundelokaal', action: { type: 'move', to: 'Maths' } },
	]
}

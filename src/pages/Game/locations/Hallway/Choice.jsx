import { isAdmin } from '../../util'
import { ChoiceButtons } from '../../components'

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions({ state, lastAction }) {
	return [
		// Desk.
		lastAction?.type === 'checkDoor' ? undefined : { text: 'Bekijk de deur naar buiten', action: 'checkDoor' },

		// Riddle.
		state.hallRiddlesSolved === 3 || lastAction?.type === 'checkTables' ? undefined : { text: 'Bekijk de tafels van dichterbij', action: 'checkTables' },
		state.hallRiddlesSolved !== 3 && isAdmin() ? { text: 'Admin mode: los raadsel op', action: 'solveRiddle' } : undefined,

		// Get doors.
		state.chairsGathered ? undefined : { text: 'Haal meer bureaustoelen', action: 'gatherChairs' },

		// Talk with the teacher.
		state.hallRiddlesSolved === 3 && lastAction?.type !== 'pushChair' ? { text: 'Geef de bureaustoel een zet', action: 'pushChair' } : undefined,
		state.hallRiddlesSolved === 3 ? { text: 'Praat met de wiskundedocent', action: 'talk' } : undefined,

		// History.
		{ text: 'Ga terug naar het wiskundelokaal', action: { type: 'move', to: 'Maths' } },
	]
}

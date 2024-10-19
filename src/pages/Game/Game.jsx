import { useLocalStorageState } from 'util'
import { Subpage } from 'components'

import { ResetButton } from './components'
import * as locations from './locations'
import { initialHistory, localStorageKey, getState, getNumVisits } from './engine'

export function Game() {
	const [history, setHistory, clearHistory] = useLocalStorageState(initialHistory, localStorageKey)

	// ToDo: run a check to see if the history is still valid. If not, clear it.

	// Render the Game.
	return <Subpage>
		<ResetButton {...{ clearHistory }} />
		{history.map((item, index) => {
			// Gather data about the location that we're in.
			const { location, actions } = item
			const state = getState(history, index)
			return <Location key={index} {...{ location, actions, state, index, history, setHistory }} />
		})}
	</Subpage>
}

function Location({ location, actions, state, index, history }) {
	const locationComponents = locations[location]

	// Render the intro to the location.
	const numVisits = getNumVisits(history, location, index)
	const Location = locationComponents.Location
	return <Location {...{ numVisits, state }} />
}

import { lastOf, useLocalStorageState } from 'util'
import { Subpage } from 'components'

import * as locations from './locations'
import { initialHistory, localStorageKey, getState, getNumVisits } from './engine'

export function Game() {
	const [history, setHistory, clearHistory] = useLocalStorageState(initialHistory, localStorageKey)

	// ToDo: run a check to see if the history is still valid. If not, clear it.

	// Render the Game.
	return <Subpage>
		{history.map((item, locationIndex) => {
			// Gather data about the location that we're in.
			const { location, actions } = item
			const state = getState(history, locationIndex)
			const isCurrentLocation = locationIndex === history.length - 1
			return <Location key={locationIndex} {...{ location, isCurrentLocation, actions, state, locationIndex, history, setHistory, clearHistory }} />
		})}
	</Subpage>
}

function Location(props) {
	const { history, location, actions, locationIndex, isCurrentLocation } = props
	const locationComponents = locations[location]

	// Render the intro to the location.
	const numVisits = getNumVisits(history, location, locationIndex)
	const { Location, Action, Choice } = locationComponents

	return <>
		<Location {...{ ...props, numVisits }} />
		{(actions || []).map((actionData, actionIndex) => {
			const isCurrentAction = isCurrentLocation && actionIndex === actions.length - 1
			return <Action key={actionIndex} {...{ ...props, ...actionData, actionIndex, isCurrentAction }} />
		})}
		<Choice {...{ ...props, lastAction: lastOf(actions || []) }} />
	</>
}

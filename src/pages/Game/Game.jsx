import { useCallback, useEffect } from 'react'
import Alert from '@mui/material/Alert'

import { lastOf, useLocalStorageState } from 'util'
import { Subpage } from 'components'

import * as locations from './locations'
import { initialHistory, localStorageKey, updateHistory, getState, getNumVisits, getNumActionVisits } from './engine'

export function Game() {
	const [history, setHistory, clearHistory] = useLocalStorageState(initialHistory, localStorageKey)
	const submitAction = useCallback((action) => setHistory(history => updateHistory(history, action)), [setHistory])

	// Gather all data and functions in one place.
	const data = { history, setHistory, clearHistory, submitAction }

	// ToDo: run a check to see if the history is still valid. If not, clear it.

	// Render the Game.
	return <Subpage>
		<Alert severity="info" sx={{my: 2}}>De Escape Room is nog in ontwikkeling. Op het moment staat alleen de eerste kamer online als teaser. De volledige Escape Room is beschikbaar vanaf <strong>6 januari 2025</strong>.</Alert>
		{history.map((item, locationIndex) => {
			// Gather data about the location that we're in.
			const { location, actions } = item
			const isCurrentLocation = locationIndex === history.length - 1
			const state = getState(history, locationIndex)
			return <Location key={locationIndex} {...{ ...data, location, locationIndex, isCurrentLocation, actions, state }} />
		})}
	</Subpage>
}

function Location(props) {
	const { history, location, actions, locationIndex, isCurrentLocation } = props
	const locationComponents = locations[location]

	// Calculate relevant parameters.
	const numVisits = getNumVisits(history, location, locationIndex)

	// Render the location.
	const { Location, Action } = locationComponents
	return <>
		<Location {...{ ...props, numVisits }} />
		{actions.map((actionData, actionIndex) => {
			const isCurrentAction = isCurrentLocation && actionIndex === actions.length - 1
			const numActionVisits = getNumActionVisits(history, location, actionData.action.type, locationIndex, actionIndex)
			return <Action key={actionIndex} {...{ ...props, ...actionData, actionIndex, isCurrentAction, numActionVisits }} />
		})}
		{isCurrentLocation ? <ChoiceSelection {...props} /> : null}
	</>
}

function ChoiceSelection(props) {
	const { location, state: locationState, actions } = props
	const locationComponents = locations[location]

	// Determine the last action taken at this location.
	const lastActionData = lastOf(actions)
	const lastAction = lastActionData?.action
	const state = lastActionData?.state || locationState

	// On a change in action, scroll to the bottom of the page.
	useEffect(() => {
		document.documentElement.scrollTop = document.documentElement.scrollHeight
	}, [lastAction])

	// Render the Choice component of the location.
	const { Choice } = locationComponents
	return <Choice {...{ ...props, lastAction, state }} />
}

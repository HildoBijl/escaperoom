import { lastOf } from 'util'

import { getLocation, getState } from './util'
import { updateState } from './updateState'

/* The updateHistory function wraps the updateState function to store all process within the game. This history can then be displayed as a "story" to the user.
 * The history object is set up as a list of locations the user has visited. So it is a list of the form [{ location: "...", actions: [{ { action: {...}, state: {...} }, ...] }, ...]. Note that the state stored with the respective action is the state after said action is processed.
 * The function below receives a current history and a new action and updates the history, preserving its format.
 */
export function updateHistory(history, action) {
	// The action should be an object. If it's a string, turn it into an object.
	if (typeof action === 'string')
		action = { type: action }

	// Determine the new location and state.
	const location = getLocation(history)
	const state = getState(history)
	const { location: newLocation, state: newState } = updateState(location, state, action)

	// Add the action and the state into the history of the current location.
	const lastHistoryElement = lastOf(history)
	const lastLocationActions = lastHistoryElement.actions
	history = [
		...history.slice(0, -1),
		{
			...lastHistoryElement,
			actions: [
				...lastLocationActions,
				{
					action,
					state: newState,
				},
			]
		}
	]

	// If we moved to a new location, add this to the history.
	if (newLocation !== location)
		history = [...history, { location: newLocation, actions: [] }]

	// All updated. Return the history.
	return history
}

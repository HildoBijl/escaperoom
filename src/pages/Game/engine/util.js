import { lastOf } from 'util'

import { initialState } from './settings'

// getLocation gets the location of the user from the game history.
export function getLocation(history) {
	return lastOf(history).location
}

// getState gets the state from the game history. Optionally an index can be given to get the state of the game on entering the location at the given index.
export function getState(history, index = history.length) {
	// On entering the first location, the game was in the initial state.
	if (index === 0)
		return initialState

	// Get the actions of the previous location and find the last state there.
	const actions = history[index - 1]?.actions || []
	if (actions.length > 0)
		return lastOf(actions).state

	// In the special case that the previous location has no actions either, go back one location further.
	return getState(history, index - 1)
}

// getNumVisits calculates how many times the user has visited a given location. Optionally, a "beforeIndex" can be given to count the number of visits before a certain history index.
export function getNumVisits(history, location, beforeIndex = history.length) {
	return history.reduce((counter, item, index) => counter + (index < beforeIndex && item.location === location ? 1 : 0), 0)
}

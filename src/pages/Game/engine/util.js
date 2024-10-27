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
	const actions = history[index - 1].actions
	if (actions.length > 0)
		return lastOf(actions).state

	// In the special case that the previous location has no actions either, go back one location further.
	return getState(history, index - 1)
}

// getPreviousAction finds the action taken previous to the current action.
export function getPreviousAction(history, locationIndex, actionIndex) {
	if (actionIndex === 0) {
		if (locationIndex === 0)
			return undefined
		return lastOf(history[locationIndex - 1].actions).action
	}
	return history[locationIndex].actions[actionIndex - 1].action
}

// getNextAction finds the action taken after the current action.
export function getNextAction(history, locationIndex, actionIndex) {
	if (actionIndex === history[locationIndex].actions.length - 1) {
		if (locationIndex === history.length - 1)
			return undefined
		return history[locationIndex + 1].actions[0]?.action
	}
	return history[locationIndex].actions[actionIndex + 1].action
}

// getNumVisits calculates how many times the user has visited a given location. Optionally, a "beforeIndex" can be given to count the number of visits before a certain history index.
export function getNumVisits(history, location, beforeIndex = Infinity) {
	return history.reduce((counter, item, index) => counter + (index < beforeIndex && item.location === location ? 1 : 0), 0)
}

// getNumActionVisits calculates how many times the user has taken a given action in a given location.
export function getNumActionVisits(history, location, actionType, locationIndex = Infinity, actionIndex = Infinity) {
	return history.reduce((counter, item, currLocationIndex) => counter + (currLocationIndex <= locationIndex && item.location === location ? (
		item.actions.reduce((counter, actionData, currActionIndex) => counter + ((currLocationIndex < locationIndex || currActionIndex < actionIndex) && actionData.action.type === actionType ? 1 : 0), 0)
	) : 0), 0)
}

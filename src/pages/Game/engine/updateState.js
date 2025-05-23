import { increment } from 'firebase/firestore'

import { getRandomInteger, getRandomPermutation } from 'util'
import { updateDocument } from 'fb'

import { isAdmin } from '../util'

/* The updateState function is the game engine. It works as a reducer. It takes three parameters:
 * - location (string): where the user is. For instance "Office".
 * - state (object): the current state of the game. It has all data about the progress, like which doors have been unlocked.
 * - action (object): an action to be taken. It always has a type property, like "Search", and on top of that potential additional payload.
 * The function then returns an object with two properties:
 * - location (string): the new location of the user.
 * - state (object): the new state of the game.
 * This functionality basically describes the entire game.
 */
export function updateState(location, state, action) {
	state = { ...state }

	// On a move action, apply it directly.
	if (action.type === 'move')
		return { state, location: action.to }

	// For each location, check each possible action.
	switch (location) {
		case 'Office':
			switch (action.type) {
				case 'search': // No state change.
					break
				case 'lookAround': // No state change.
					break
				case 'checkDoor':
					state.officeDoor = {
						checked: true,
						seed: getRandomInteger(22, 30, [26]),
					}
					break
				case 'checkBox': // No state change.
					break
				case 'return': // No state change.
					break
				case 'unlockDoor':
					state.officeDoor = { ...state.officeDoor, unlocked: true }
					location = 'Maths'
					if (!isAdmin())
						updateDocument('statistics', 'solves', { r1: increment(1) })
					break
				default:
					throw new Error(`Invalid action type: received action type "${action.type}" but this is not a possible action in the room "${location}".`)
			}
			break

		case 'Maths':
			switch (action.type) {
				case 'checkPosters': // No state change.
					break
				case 'checkBlackboard': // No state change.
					break
				case 'checkDoor': // No state change.
					if (action.to === 'Music' && !state.musicDoor) {
						state.musicDoor = {
							seed1: getRandomPermutation(5),
							seed2: getRandomPermutation(10),
						}
					}
					break
				case 'unlockDoor':
					switch (action.to) {
						case 'Music':
							state.musicDoorUnlocked = true
							location = 'Music'
							if (!isAdmin())
								updateDocument('statistics', 'solves', { r2a: increment(1) })
							break
						case 'History':
							state.historyDoorUnlocked = true
							location = 'History'
							if (!isAdmin())
								updateDocument('statistics', 'solves', { r3a: increment(1) })
							break
						default:
							throw new Error(`Invalid action to parameter: received action type "${action.type}" in room "${location}" but could not determine to unlock the door to what. The parameter value was "${action.to}"`)
					}
					break
				default:
					throw new Error(`Invalid action type: received action type "${action.type}" but this is not a possible action in the room "${location}".`)
			}
			break

		case 'Music':
			switch (action.type) {
				case 'checkBlackboard': // No state change.
					break
				case 'search': // No state change.
					break
				case 'checkDoor': // No state change.
					break
				case 'unlockDoor':
					state.artDoorUnlocked = true
					location = 'Art'
					if (!isAdmin())
						updateDocument('statistics', 'solves', { r2b: increment(1) })
					break
				default:
					throw new Error(`Invalid action type: received action type "${action.type}" but this is not a possible action in the room "${location}".`)
			}
			break

		case 'Art':
			switch (action.type) {
				case 'checkPaintings': // No state change.
					break
				case 'checkBox': // No state change.
					break
				case 'checkDoor': // No state change.
					break
				case 'unlockDoor':
					state.hall1Unlocked = true
					if (!isAdmin())
						updateDocument('statistics', 'solves', { r2c: increment(1) })
					break
				default:
					throw new Error(`Invalid action type: received action type "${action.type}" but this is not a possible action in the room "${location}".`)
			}
			break

		case 'History':
			switch (action.type) {
				case 'checkBlackboard': // No state change.
					break
				case 'checkDoor': // No state change.
					break
				case 'unlockDoor':
					state.dutchDoorUnlocked = true
					location = 'Dutch'
					if (!isAdmin())
						updateDocument('statistics', 'solves', { r3b: increment(1) })
					break
				default:
					throw new Error(`Invalid action type: received action type "${action.type}" but this is not a possible action in the room "${location}".`)
			}
			break

		case 'Dutch':
			switch (action.type) {
				case 'checkDesk': // No state change.
					break
				case 'checkBox': // No state change.
					if (!state.dutchDoor) {
						state.dutchDoor = {
							seed: getRandomPermutation(10),
						}
					}
					break
				case 'checkDoor': // No state change.
					break
				case 'unlockDoor':
					state.hall2Unlocked = true
					if (!isAdmin())
						updateDocument('statistics', 'solves', { r3c: increment(1) })
					break
				default:
					throw new Error(`Invalid action type: received action type "${action.type}" but this is not a possible action in the room "${location}".`)
			}
			break

		case 'Hallway':
			switch (action.type) {
				case 'checkDoor': // No state change.
					break
				case 'checkTables': // No state change.
					break
				case 'gatherChairs':
					state.chairsGathered = true
					break
				case 'solveRiddle':
					state.hallRiddlesSolved = (state.hallRiddlesSolved || 0) + 1
					if (!isAdmin())
						updateDocument('statistics', 'solves', { [`r4${'abcdefghijklmnopqrstuvwxyz'[state.hallRiddlesSolved - 1]}`]: increment(1) })
					break
				case 'talk':
					state.allDone = true
			}
	}

	// Return the updated data.
	return {
		state,
		location
	}
}

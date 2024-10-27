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
				case 'checkDoor':
					state.officeDoorChecked = true
					break
				case 'unlockDoor':
					state.officeDoorUnlocked = true
					location = 'Maths'
					break
			}
	}

	// Return the updated data.
	return {
		state,
		location
	}
}

import { useState, useCallback } from 'react'

// useLocalStorageState is like useState, but it then tracks the property in localStorage too. Upon saving, it stores to localStorage. Upon initializing, it tries to get the value back from localStorage.
export function useLocalStorageState(initialValue, lsKey) {
	// Set up a state that tracks the local storage.
	const lsValue = localStorage.getItem(lsKey)
	const [state, setState] = useState((lsValue === undefined || lsValue === null) ? initialValue : JSON.parse(lsValue))

	// Expand the setState to also store state updates.
	const expandedSetState = useCallback((newState) => {
		if (typeof newState === 'function') {
			const givenSetState = newState
			setState(state => {
				const newState = givenSetState(state)
				localStorage.setItem(lsKey, JSON.stringify(newState))
				return newState
			})
		} else {
			localStorage.setItem(lsKey, JSON.stringify(newState))
			setState(newState)
		}
	}, [lsKey, setState])

	// Add a clear function to get rid of the local storage and go back to the initial value.
	const clearState = useCallback(() => {
		localStorage.removeItem(lsKey)
		setState(initialValue)
	}, [initialValue, lsKey])

	// Return the tuple.
	return [state, expandedSetState, clearState]
}

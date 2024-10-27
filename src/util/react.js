import { useRef, useEffect } from 'react'

import { ensureConsistency } from './objects'

// usePrevious gives the value that the given parameter had on the previous render.
function usePrevious(value) {
	const ref = useRef()
	useEffect(() => {
		ref.current = value
	})
	return ref.current
}

// useLatest is used to directly store a value in a ref. This is useful when you have use-only functions in a useEffect function: plug them in a ref, apply the ref in the useEffect function and the function isn't triggered so much. (Note: this is different from the @react-hook/latest, which uses an event and is hence too slow.)
export function useLatest(value, initialValue = value) {
	const ref = useRef(initialValue)
	ref.current = value
	return ref
}

// useCurrentOrPrevious will check if the current object still exists. If not, the previous one is used. This is useful for keeping the layout intact while an object slides into hiding.
export function useCurrentOrPrevious(value) {
	const previousValue = usePrevious(value)
	return value || previousValue
}

// useConsistentValue will check if the given value is the same as previously. If the reference changes, but a deepEquals check still results in the same object, the same reference will be maintained.
export function useConsistentValue(value) {
	const ref = useRef()
	ref.current = ensureConsistency(value, ref.current)
	return ref.current
}

// useEventListener sets up event listeners for the given elements, executing the given handler. It ensures to efficiently deal with registering and unregistering listeners. The element parameter can be a DOM object or an array of DOM objects. It is allowed to insert ref objects whose "current" parameter is a DOM object. In addition, the eventName attribute may be an array. The handler may be a single function (in which case it's used for all eventNames) or an array with equal length as the eventName array.
export function useEventListener(eventName, handler, elements = window, options = {}) {
	// If the handler changes, remember it within the ref. This allows us to change the handler without having to reregister listeners.
	eventName = useConsistentValue(eventName)
	const handlerRef = useLatest(handler)
	elements = useConsistentValue(elements)
	options = useConsistentValue(options)

	// Ensure that the elements parameter is an array of existing objects.
	elements = (Array.isArray(elements) ? elements : [elements])
	elements = elements.map(element => {
		if (!element)
			return false // No element. Throw it out.
		if (element.addEventListener)
			return element // The element can listen. Keep it.
		if (element.current && element.current.addEventListener)
			return element.current // There is a "current" property that can listen. The object is most likely a ref.
		return false // No idea. Throw it out.
	})
	elements = elements.filter(element => element) // Throw out non-existing elements or elements without an event listener.
	elements = useConsistentValue(elements)

	// Set up the listeners using another effect.
	useEffect(() => {
		// Set up redirecting handlers (one for each event name) which calls the latest functions in the handlerRef. 
		const eventNames = Array.isArray(eventName) ? eventName : [eventName]
		const redirectingHandlers = eventNames.map((_, index) => {
			return (event) => {
				const handler = handlerRef.current
				const currHandler = Array.isArray(handler) ? handler[index] : handler
				currHandler(event)
			}
		})

		// Add event listeners for each of the handlers, to each of the elements.
		eventNames.forEach((eventName, index) => {
			const redirectingHandler = redirectingHandlers[index]
			elements.forEach(element => element.addEventListener(eventName, redirectingHandler, options))
		})

		// Make sure to remove all handlers upon a change in settings or upon a dismount.
		return () => {
			eventNames.forEach((eventName, index) => {
				const redirectingHandler = redirectingHandlers[index]
				elements.forEach(element => element.removeEventListener(eventName, redirectingHandler))
			})
		}
	}, [eventName, handlerRef, elements, options]) // Reregister only when the event type or the listening objects change.
}

// useEventListeners takes an object like { mouseenter: (evt) => {...}, mouseleave: (evt) => {...} } and applies event listeners to it.
export function useEventListeners(handlers, elements, options) {
	useEventListener(Object.keys(handlers), Object.values(handlers), elements, options)
}

// useRefWithEventListeners takes an object like { mouseenter: (evt) => {...}, mouseleave: (evt) => {...} } and returns a ref. If the ref is coupled to a DOM object, this DOM object listens to the relevant events.
export function useRefWithEventListeners(handlers, options) {
	const ref = useRef()
	useEventListeners(handlers, ref, options)
	return ref
}

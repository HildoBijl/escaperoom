import { useState, useRef, useEffect, useCallback } from 'react'

import { easeShiftSlow } from './numbers'
import { ensureConsistency } from './objects'

// getEventPosition takes an event and gives the coordinates (client) at which it happens. It does this by return a vector to said point. On a touch event, it extracts the first touch.
export function getEventPosition(event) {
	const obj = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]) || event
	if (obj.clientX === undefined || obj.clientY === undefined)
		return null
	return { x: obj.clientX, y: obj.clientY }
}

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

// useMousePosition returns the position of the mouse in client coordinates.
export function useMousePosition() {
	const [position, setPosition] = useState()

	// Track the position of the mouse.
	const storeData = (event) => setPosition(getEventPosition(event))
	useEventListener(['mousemove', 'touchstart', 'touchmove'], storeData)
	return position
}

// transformClientToSvg turns a client position to an SVG position. Both points are given in {x, y} form.
export function transformClientToSvg(pos, svg) {
	if (!pos || !svg)
		return undefined
	const matrix = svg.getScreenCTM()
	return {
		x: (pos.x - matrix.e) / matrix.a,
		y: (pos.y - matrix.f) / matrix.d,
	}
}

// transformSvgToClient turns an SVG position to a client position. Both points are given in {x, y} form.
export function transformSvgToClient(pos, svg) {
	if (!pos || !svg)
		return undefined
	const matrix = svg.getScreenCTM()
	return {
		x: pos.x * matrix.a + matrix.e,
		y: pos.y * matrix.d + matrix.f,
	}
}

// useAnimation takes an animation function and calls it several times per second with both (1) the time since mounting, and (2) the time difference dt since the last call. On the first call dt is undefined.
export function useAnimation(animationFunc) {
	const startTimeRef = useRef()
	const previousTimeRef = useRef()
	const requestRef = useRef()
	const animationFuncRef = useLatest(animationFunc)

	// Set up an animate function that keeps calling itself.
	const animate = useCallback(pageTime => {
		// Calculate all relevant times.
		let dt, time
		if (startTimeRef.current === undefined) {
			startTimeRef.current = pageTime // Remember the starting time.
			time = 0
		} else {
			time = pageTime - startTimeRef.current
			dt = pageTime - previousTimeRef.current
		}
		previousTimeRef.current = pageTime

		// Call the given animation function, and then call itself a tiny bit later.
		animationFuncRef.current(time, dt)
		requestRef.current = requestAnimationFrame(animate)
	}, [startTimeRef, previousTimeRef, animationFuncRef])

	// Start the animation cycle upon mounting.
	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate)
		return () => cancelAnimationFrame(requestRef.current)
	}, [requestRef, animate])
}

// useTransitionedValue will apply slow transitioning of a given value, adjusting it over time.
export function useTransitionedValue(targetValue, transitionTime = 1000, easing = easeShiftSlow) {
	const previousTargetValue = usePrevious(targetValue)
	const [update, setUpdate] = useState()
	const [value, setValue] = useState(targetValue)

	// When the target value changes, note that there is an update.
	useEffect(() => {
		if (previousTargetValue !== undefined && previousTargetValue !== targetValue) {
			setUpdate({ oldValue: previousTargetValue, newValue: targetValue, changedOn: new Date() })
		}
	}, [previousTargetValue, targetValue, setUpdate])

	// Regularly adjust the current value based on the update.
	useAnimation(() => {
		if (!update)
			return

		// Check if the transition already finished.
		const timePassed = new Date() - update.changedOn
		if (timePassed >= transitionTime) {
			setValue(update.newValue)
			setUpdate()
			return
		}

		// Calculate the current state of the transition.
		const partPassed = timePassed / transitionTime
		const easedPartPassed = easing(partPassed)
		setValue(update.oldValue + easedPartPassed * (update.newValue - update.oldValue))
	})

	// Return the value that we want to display.
	return value
}

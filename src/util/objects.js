// lastOf gives the last element of an array.
export function lastOf(array) {
	return array[array.length - 1]
}

// isObject checks if a variable is an object.
export function isObject(obj) {
	return typeof obj === 'object' && obj !== null
}

// isBasicObject checks if a variable is a simple object made through {...}. So not one through a constructor with various methods.
export function isBasicObject(obj) {
	return isObject(obj) && obj.constructor === Object
}

// deepEquals checks whether two objects are equal. It does this iteratively: if the parameters are objects or arrays, these are recursively checked. It tracks references of objects to prevent infinite loops.
export function deepEquals(a, b, referenceList = []) {
	// Check reference equality.
	if (a === b)
		return true

	// Check if any of the objects already were in the object list. If so, stop iterating to prevent infinite loops.
	if (isObject(a) && isObject(b)) {
		const aRef = referenceList.find(obj => obj.a === a)?.a
		const bRef = referenceList.find(obj => obj.b === b)?.b
		if (aRef || bRef)
			return (aRef === a && bRef === b) || (aRef === b && bRef === a) // Return true if the references both point to the starting objects.
		referenceList = [...referenceList, { a, b }]
	}

	// Check for arrays.
	if (Array.isArray(a) && Array.isArray(b))
		return a.length === b.length && a.every((value, index) => deepEquals(value, b[index], referenceList))

	// Check for non-object types.
	if (!isObject(a) || !isObject(b))
		return a === b

	// Check constructor.
	if (a.constructor !== b.constructor)
		return false

	// Check number of keys.
	const keys1 = Object.keys(a)
	const keys2 = Object.keys(b)
	if (keys1.length !== keys2.length)
		return false

	// Merge keys and check new length.
	const keys = [...new Set([...keys1, ...keys2])]
	if (keys.length !== keys1.length)
		return false

	// Walk through keys and check equality.
	return keys.every(key => deepEquals(a[key], b[key], referenceList))
}

// keysToObject takes an array of keys like ['num', 'den'] and applies a function func(key, index, resultObject) for each of these keys. The result is stored in an object like { num: func('num'), den: func('den') }. If the result is undefined, it is not stored in the object, unless specifically indicated.
export function keysToObject(keys, func, filterUndefined = true) {
	const result = {}
	keys.forEach((key, index) => {
		const funcResult = func(key, index, result)
		if (funcResult !== undefined || !filterUndefined)
			result[key] = funcResult
	})
	return result
}

// applyMapping takes an object with multiple parameters, like { a: 2, b: 3 }, and applies a function like (x, key) => 2*x to each parameter. It returns a new object (the old one is unchanged) with the result, like { a: 4, b: 6 }. It can also receive an array, in which case it returns an array (just like array map). For objects it filters out undefined. For arrays it does not.
export function applyMapping(obj, func) {
	if (Array.isArray(obj))
		return obj.map(func)
	if (isObject(obj))
		return keysToObject(Object.keys(obj), (key, index, resultObject) => func(obj[key], key, resultObject))
	throw new Error(`Invalid applyMapping call: received a call with as input something of type "${typeof obj}". Could not process this. Only objects and arrays are allowed.`)
}

// ensureConsistency takes a new value and compares it with the old value. It tries to maintain consistency. If the new value deepEquals the old value, but has a different reference (is cloned/reconstructed) the old value is return, to maintain reference equality. If the value is an object, the process is repeated for its children in an iterative way.
export function ensureConsistency(newValue, oldValue) {
	// On a deepEquals, return the old value to keep the reference intact.
	if (deepEquals(newValue, oldValue))
		return oldValue

	// deepEquals gives false. Something is different. For arrays/basic objects try to at least keep child parameters the same.
	if ((Array.isArray(newValue) && Array.isArray(oldValue)) || (isBasicObject(newValue) && isBasicObject(oldValue)))
		return applyMapping(newValue, (parameter, index) => ensureConsistency(parameter, oldValue[index]))

	// For simple parameter types or complex objects there's not much we can do.
	return newValue
}

// findOptimumIndex takes an array of objects, like [{x: 3}, {x: 2}, {x: 5}]. It also takes a comparison function (a, b) => [bool], indicating whether a is better than b. For example, to find the object with the highest x, use "(a, b) => a > b". It then returns the index of the object with the optimal value. Returns -1 on an empty array.
export function findOptimumIndex(array, isBetter) {
	return array.reduce((bestIndex, element, index) => bestIndex === -1 || isBetter(element, array[bestIndex]) ? index : bestIndex, -1)
}

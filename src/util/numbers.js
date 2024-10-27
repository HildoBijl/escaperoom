// getRandomInteger returns a random integer between (including) the given bounds.
export function getRandomInteger(min, max, exclude = []) {
	const num = Math.floor(min + (max + 1 - min) * Math.random())
	if (exclude.includes(num))
		return getRandomInteger(min, max, exclude)
	return num
}

// These are a few easing functions.
export const easeInOut = x => (x * x) / (2 * (x * x - x) + 1)
export const easeShift = x => x < 0.5 ? 2 * x ** 2 : 1 - 2 * (1 - x) ** 2
export const easeShiftSlow = x => x < 0.5 ? 4 * x ** 3 : 1 - 4 * (1 - x) ** 3

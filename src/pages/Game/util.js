// cases takes a number, like a number of visits. "It's time 0 (or 2, or 10) that we're in this room." It also takes thresholds like [0, 2, 5, Infinity] and outputs ["A", "B", "C", "D"]. If the case is at most the first threshold, the first output is shown, if it is at most the second threshold, the second output is shown, and so forth. So in the example, we'd get A, B, B, C, C, C, and then only D.
export function cases(num, thresholds, outputs) {
	const index = thresholds.findIndex(threshold => num <= threshold)
	if (index === -1)
		return null
	return outputs[index]
}

// isAdmin checks if admin mode has been turned on.
export function isAdmin() {
	return localStorage.getItem('adminmode') === "on"
}

import { mod } from './numbers'

export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })
export const subtract = (a, b) => ({ x: a.x - b.x, y: a.y - b.y })
export const squaredDistance = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2

// arePointsEqual checks if two points are equal.
export function arePointsEqual(p1, p2) {
	return squaredDistance(p1, p2) < 1e-12
}

// getPointsBounds returns, for a series of points, the minimal and maximal value of x and y.
export function getPointsBounds(points) {
	let minX, maxX, minY, maxY
	points.forEach(point => {
		if (minX === undefined || point.x < minX)
			minX = point.x
		if (maxX === undefined || point.x > maxX)
			maxX = point.x
		if (minY === undefined || point.y < minY)
			minY = point.y
		if (maxY === undefined || point.y > maxY)
			maxY = point.y
	})
	return { minX, maxX, minY, maxY }
}

// doLinesIntersect takes two lines pieces [{x: 0, y: 0}, {x: 0, y: 2}] and [{x: -1, y: 1}, x: 1, y: 1}] and checks if these two line pieces intersect.
export function doLinesIntersect(l1, l2) {
	const [p1a, p1b] = l1
	const [p2a, p2b] = l2

	// Check the determinant for parallel lines.
	const det = (p1b.x - p1a.x) * (p2b.y - p2a.y) - (p2b.x - p2a.x) * (p1b.y - p1a.y)
	if (Math.abs(det) < 1e-16)
		return false

	// Find where on the two lines the intersection point is.
	const lambda = ((p2b.y - p2a.y) * (p2b.x - p1a.x) + (p2a.x - p2b.x) * (p2b.y - p1a.y)) / det
	const gamma = ((p1a.y - p1b.y) * (p2b.x - p1a.x) + (p1b.x - p1a.x) * (p2b.y - p1a.y)) / det
	return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)
}

// isPointInsideShape uses ray casting to check if a point falls within a polygon.
export function isPointInsideShape(p, s) {
	const { x, y } = p
	let inside = false
	s.forEach((p, i) => {
		const { x: xa, y: ya } = p
		const { x: xb, y: yb } = s[(i + 1) % s.length]
		var intersect = ((yb > y) != (ya > y)) && (x < (xa - xb) * (y - yb) / (ya - yb) + xb)
		if (intersect)
			inside = !inside
	})
	return inside
}

// doShapesIntersect checks if parts of a shape intersect: some line of one shape crosses some line of the other shape. (It does not check for a full overlap.)
export function doShapesIntersect(s1, s2) {
	return s1.some((p, i) => {
		const l1 = [p, s1[(i + 1) % s1.length]]
		return s2.some((p, i) => {
			const l2 = [p, s2[(i + 1) % s2.length]]
			return doLinesIntersect(l1, l2)
		})
	})
}

// doShapesOverlap checks if parts (or all) of a shape overlap.
export function doShapesOverlap(s1, s2) {
	if (areShapesEqual(s1, s2))
		return true // The shapes are identical.
	if (doShapesIntersect(s1, s2))
		return true // Some lines cross.
	if (isPointInsideShape(s1[0], s2) || isPointInsideShape(s2[0], s1))
		return true // One shape is fully encompassed in another.
	return false
}

// areShapesEqual checks if two shapes are equal. Note: this function does not work yet if a shape has multiple identical points.
export function areShapesEqual(s1, s2) {
	// Find a single matching point.
	const shift = s2.findIndex(p => arePointsEqual(s1[0], p))
	if (shift === -1)
		return false

	// From that point, check if all points match. Walk in both directions to account for clockwise/counterclockwise.
	return s1.every((p1, i) => arePointsEqual(p1, s2[mod(shift + i, s2.length)])) || s1.every((p1, i) => arePointsEqual(p1, s2[mod(shift - i, s2.length)]))
}

// isShapeInsideShape checks if a shape is fully encompassed in another shape.
export function isShapeInsideShape(s1, s2) {
	if (doShapesIntersect(s1, s2))
		return false // Some lines cross.
	return isPointInsideShape(s1[0], s2)
}

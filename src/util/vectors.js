
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })
export const subtract = (a, b) => ({ x: a.x - b.x, y: a.y - b.y })
export const squaredDistance = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2

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

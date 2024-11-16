
export const subtract = (a, b) => ({ x: a.x - b.x, y: a.y - b.y })
export const squaredDistance = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2
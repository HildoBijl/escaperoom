import { useState, useRef, useEffect } from 'react'
import { useTheme, darken, lighten } from '@mui/material/styles'

import { findOptimumIndex, useEventListener, useRefWithEventListeners, getEventPosition, useMousePosition, transformClientToSvg, useTransitionedValue } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'

// Set up settings for the Interface.
const initialNumbers = [11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const size = 72
const margin = 36
const gap = 24
const radius = 10

const posToRowCol = pos => ({
	x: [0, 1, 2, 3, 3, 3, 3, 2, 1, 0, 0, 0][pos],
	y: [0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 2, 1][pos],
})
const posToCoords = pos => ({
	x: margin + size / 2 + posToRowCol(pos).x * (size + gap),
	y: margin + size / 2 + posToRowCol(pos).y * (size + gap),
})
const subtract = (a, b) => ({ x: a.x - b.x, y: a.y - b.y })
const squaredDistance = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2

const marginLong = 24
const marginShort = 10
const containerParameters = { rx: radius, ry: radius, strokeWidth: 6, style: { opacity: 1, fill: 'none' } }

// Render the interface.
export function Interface({ state, submitAction, isCurrentAction }) {
	const active = isCurrentAction
	const theme = useTheme()
	const svgRef = useRef()
	const seed = state.officeDoor.seed
	const [numbers, setNumbers] = useRiddleStorage('officeDoor', initialNumbers)

	// Track the mouse position.
	const mousePositionClient = useMousePosition()

	// Set up handlers for hovering/dragging.
	const [hovering, setHovering] = useState()
	const [dragging, setDragging] = useState()
	const mousePosition = transformClientToSvg(mousePositionClient, svgRef.current)
	const startDragging = (pos, event) => {
		if (active) {
			const dragLocation = transformClientToSvg(getEventPosition(event), svgRef.current)
			const blockCoords = posToCoords(pos)
			const delta = subtract(dragLocation, blockCoords)
			setDragging({ pos, delta })
			event.preventDefault()
		}
	}
	const endDragging = (event) => {
		if (dragging) {
			const endDragLocation = transformClientToSvg(getEventPosition(event), svgRef.current)
			const closestPosition = findClosestPosition(subtract(endDragLocation, dragging.delta))
			if (closestPosition !== dragging.pos) {
				setNumbers(numbers => {
					const newNumbers = [...numbers]
					newNumbers[dragging.pos] = numbers[closestPosition]
					newNumbers[closestPosition] = numbers[dragging.pos]
					return newNumbers
				})
			}
		}
		setDragging()
	}
	useEventListener(active ? ['mouseup', 'touchend'] : [], endDragging, window) // Listen to mouse-up on entire window.
	const closestPosition = (mousePosition && dragging) ? findClosestPosition(subtract(mousePosition, dragging.delta)) : undefined

	// Check the value of the input.
	const correct = [
		numbers[0] + numbers[1] + numbers[2] + numbers[3] === seed,
		numbers[3] + numbers[4] + numbers[5] + numbers[6] === seed,
		numbers[6] + numbers[7] + numbers[8] + numbers[9] === seed,
		numbers[9] + numbers[10] + numbers[11] + numbers[0] === seed,
	]
	const allCorrect = correct.every(value => value)
	useEffect(() => {
		if (allCorrect && isCurrentAction)
			submitAction('unlockDoor')
	}, [allCorrect, isCurrentAction, submitAction])

	// Set up a handler to render a block.
	const renderBlock = (pos) => {
		const num = numbers[pos]
		const hover = hovering === pos
		const drag = dragging?.pos === pos
		const delta = dragging?.delta
		const closest = !drag && (closestPosition === pos)
		const onDown = (event) => startDragging(pos, event)
		const onHoverStart = () => setHovering(active && pos)
		const onHoverEnd = () => setHovering()
		return <Block key={num} {...{ num, pos, hover, drag, delta, mousePosition, closest, onDown, onHoverStart, onHoverEnd, active }} />
	}

	// Render the interface.
	const getContainerColor = correct => correct ? darken(theme.palette.success.main, 0.3) : darken(theme.palette.error.main, 0.3)
	return <Svg ref={svgRef} size={4 * size + 3 * gap + 2 * margin} style={{ borderRadius: '1rem', overflow: 'visible' }}>

		{/* Feedback rectangles. */}
		<rect x={margin - marginShort} y={margin - marginLong} width={size + 2 * marginShort} height={4 * size + 3 * gap + 2 * marginLong} {...containerParameters} stroke={getContainerColor(correct[3])} />
		<rect x={margin + 3 * (size + gap) - marginShort} y={margin - marginLong} width={size + 2 * marginShort} height={4 * size + 3 * gap + 2 * marginLong} {...containerParameters} stroke={getContainerColor(correct[1])} />
		<rect x={margin - marginLong} y={margin - marginShort} width={4 * size + 3 * gap + 2 * marginLong} height={size + 2 * marginShort} rx={radius} {...containerParameters} stroke={getContainerColor(correct[0])} />
		<rect x={margin - marginLong} y={margin + 3 * (size + gap) - marginShort} width={4 * size + 3 * gap + 2 * marginLong} height={size + 2 * marginShort} {...containerParameters} stroke={getContainerColor(correct[2])} />

		{/* Central seed number. */}
		<text x={(4 * size + 3 * gap + 2 * margin) / 2} y={(4 * size + 3 * gap + 2 * margin) / 2} style={{ fontSize: '100px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#eee' }} transform="translate(0, 10)">{seed}</text>

		{/* Block shades for when they are dragged away. */}
		{[...numbers.map((_, pos) => <Block key={pos} pos={pos} shade={true} />)]}

		{/* Number blocks. Render the dragged one last to put it on top. */}
		{[...numbers.map((_, pos) => dragging?.pos === pos ? null : renderBlock(pos)),
		dragging ? renderBlock(dragging.pos) : null]}

	</Svg>
}

function findClosestPosition(coords) {
	const squaredDistances = initialNumbers.map((_, index) => squaredDistance(coords, posToCoords(index)))
	return findOptimumIndex(squaredDistances, (a, b) => a < b)
}

function Block({ num, pos, hover, drag, delta, shade, mousePosition, closest, onDown, onHoverStart, onHoverEnd, active }) {
	const theme = useTheme()

	// Set up listeners for various events.
	const ref = useRefWithEventListeners(active ? {
		mouseenter: onHoverStart,
		mouseleave: onHoverEnd,
		mousedown: onDown,
		touchstart: onDown,
	} : {})

	// Determine the coordinates where the number should be positioned.
	const coords = (mousePosition && drag) ? subtract(mousePosition, delta) : posToCoords(pos)
	const easedCoords = {
		x: useTransitionedValue(coords?.x, drag ? 0 : theme.transitions.duration.standard),
		y: useTransitionedValue(coords?.y, drag ? 0 : theme.transitions.duration.standard),
	}

	// Render the block.
	const fill = theme.palette.primary.main
	if (!easedCoords)
		return null
	return <g ref={ref} transform={`translate(${easedCoords.x}, ${easedCoords.y})`} style={{ cursor: active ? 'grab' : 'default' }}>
		<rect key={num} x={-size / 2} y={-size / 2} width={size} height={size} rx={radius} ry={radius} fill={shade ? darken(fill, 0.7) : (hover || drag ? darken(fill, 0.4) : (closest ? lighten(fill, 0.3) : fill))} />
		{shade ? null : <text x={0} y={0} fill="#eee" style={{ fontSize: '36px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle' }} transform="translate(0, 4)">{num}</text>}
	</g>
}

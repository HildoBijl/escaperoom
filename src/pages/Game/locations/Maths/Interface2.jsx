import { useState, useRef } from 'react'
import { useTheme, lighten, styled } from '@mui/material/styles'
import { Rotate90DegreesCw as RotateIcon, Flip as FlipIcon } from '@mui/icons-material'
import Fab from '@mui/material/Fab'

import { useRefWithEventListeners, useEventListener, useTransitionedValue, transformClientToSvg, useMousePosition, getEventPosition, add, subtract, squaredDistance, getPointsBounds, findMinimumIndex } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'

// Set up settings for the Interface.
const width = 400
const height = 400
const margin = 6
const f = 60
const snapThreshold = 0.2
const lightRadius = 12
const lightMargin = 10

// Define the shapes and their initial positions.
const r = Math.sqrt(2)
const shapes = [
	[{ x: -0.5, y: -0.5 }, { x: -0.5, y: 0.5 }, { x: 0.5, y: -0.5 }], // Small triangle.
	[{ x: -0.5, y: -0.5 }, { x: -0.5, y: 0.5 }, { x: 0.5, y: -0.5 }], // Small triangle.
	[{ x: -r / 2, y: -r / 2 }, { x: -r / 2, y: r / 2 }, { x: r / 2, y: -r / 2 }], // Medium triangle.
	[{ x: -1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: -1 }], // Large triangle.
	[{ x: -1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: -1 }], // Large triangle.
	[{ x: -0.5, y: -0.5 }, { x: -0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.5, y: -0.5 }], // Square.
	[{ x: -r / 4, y: -r / 4 }, { x: -r * 3 / 4, y: r / 4 }, { x: r / 4, y: r / 4 }, { x: r * 3 / 4, y: -r / 4 }], // Trapezoid.
]
const initialPositions = [
	{ x: 0, y: -r / 2, r: 3, m: 1, i: 0 },
	{ x: -r, y: r / 2, r: -3, m: 1, i: 1 },
	{ x: -r / 2, y: -r / 2, r: 0, m: 1, i: 2 },
	{ x: r, y: 0, r: 1, m: 1, i: 3 },
	{ x: 0, y: r, r: -1, m: 1, i: 4 },
	{ x: -r / 2, y: 0, r: 1, m: 1, i: 5 },
	{ x: r / 4, y: -r * 3 / 4, r: 0, m: 1, i: 6 },
]

export function Interface({ submitAction, isCurrentAction }) {
	const active = isCurrentAction
	const theme = useTheme()
	const svgRef = useRef()
	const [positions, setPositions] = useRiddleStorage('mathsDoor2', initialPositions)
	const [selected, setSelected] = useState()

	// Set up a handler to flip the selection of a piece.
	const flipSelected = (index) => {
		// Select or deselect the item.
		setSelected(selected => selected === index ? undefined : index)

		// Move the item to the end to show it to be on top.
		setPositions(positions => {
			const positionIndex = positions.findIndex(position => position.i === index)
			return [...positions.slice(0, positionIndex), ...positions.slice(positionIndex + 1), positions[positionIndex]]
		})
	}

	// Set up handlers to rotate/flip pieces.
	const rotate = (index, cw) => {
		const elementIndex = positions.findIndex(position => position.i === index)
		const oldPosition = positions[elementIndex]
		setPositions(positions => [...positions.slice(0, elementIndex), ...positions.slice(elementIndex + 1), constrainShape({ ...oldPosition, r: oldPosition.r + oldPosition.m * (cw ? -1 : 1) }, index)])
	}
	const mirror = (index) => {
		const elementIndex = positions.findIndex(position => position.i === index)
		const oldPosition = positions[elementIndex]
		setPositions(positions => [...positions.slice(0, elementIndex), ...positions.slice(elementIndex + 1), constrainShape({ ...oldPosition, m: -oldPosition.m }, index)])
	}

	// Set up the dragging system.
	const [dragging, setDragging] = useState()
	const mousePositionClient = useMousePosition()
	const mousePosition = svgToUnity(transformClientToSvg(mousePositionClient, svgRef.current))
	const startDragging = (index, event) => {
		setSelected(index)
		if (!active || !mousePosition)
			return
		const dragLocation = svgToUnity(transformClientToSvg(getEventPosition(event), svgRef.current))
		const positionIndex = positions.findIndex(position => position.i === index)
		const position = positions[positionIndex]
		const delta = subtract(dragLocation, position)
		setDragging({ index, delta })
		setPositions(positions => { // Move the dragged element to the end so it's on top.
			const positionIndex = positions.findIndex(position => position.i === index)
			return [...positions.slice(0, positionIndex), ...positions.slice(positionIndex + 1), positions[positionIndex]]
		})
		event.preventDefault()
	}
	const endDragging = (event) => {
		if (dragging) {
			const endDragLocation = svgToUnity(transformClientToSvg(getEventPosition(event), svgRef.current))
			setPositions(positions => {
				const positionIndex = positions.findIndex(position => position.i === dragging.index)
				const newPosition = { ...positions[positionIndex], ...processDrag(endDragLocation, dragging.delta, dragging.index, positions) }
				return [...positions.slice(0, positionIndex), ...positions.slice(positionIndex + 1), newPosition]
			})
		}
		setDragging()
	}
	useEventListener(active ? ['mouseup', 'touchend'] : [], endDragging, window) // Listen to mouse-up on entire window.

	// Check the value of the input.

	// Render the interface.
	return <>
		<Svg ref={svgRef} size={[width, height]} style={{ borderRadius: '1rem', overflow: 'visible', marginBottom: '0.4rem' }}>

			{/* Shapes. */}
			{positions.map(position => {
				const drag = dragging && dragging.index === position.i
				const onDown = (event) => startDragging(position.i, event)
				if (drag)
					position = { ...position, ...processDrag(mousePosition, dragging.delta, dragging.index, positions) }
				return <Shape key={position.i} index={position.i} active={active} position={position} selected={selected === position.i} flipSelected={() => flipSelected(position.i)} drag={dragging && dragging.index === position.i} onDown={onDown} />
			})}

			{/* Grading indicators/lights. */}
			<circle fill={theme.palette.error.main} cx={width / 2} cy={lightMargin + lightRadius} r={lightRadius} />
			<circle fill={theme.palette.error.main} cx={width / 2 - 2 * lightRadius - lightMargin} cy={lightMargin + lightRadius} r={lightRadius} />
			<circle fill={theme.palette.error.main} cx={width / 2 + 2 * lightRadius + lightMargin} cy={lightMargin + lightRadius} r={lightRadius} />
			{/* ToDo */}
		</Svg>

		{/* Rotation buttons. */}
		<div style={{ display: 'flex', flexFlow: 'row nowrap', justifyContent: 'center', gap: '1rem', }}>
			<Fab color="primary" disabled={selected === undefined} onClick={() => selected !== undefined && rotate(selected, true)}>
				<RotateIcon />
			</Fab>
			<Fab color="primary" disabled={selected === undefined} onClick={() => selected !== undefined && rotate(selected, false)}>
				<RotateIcon sx={{ transform: 'scaleX(-1)' }} />
			</Fab>
			<Fab color="primary" disabled={selected === undefined} onClick={() => selected !== undefined && mirror(selected)}>
				<FlipIcon />
			</Fab>
		</div>
	</>
}

function Shape({ index, active, position, selected, onDown, drag }) {
	const theme = useTheme()

	// Set up listeners for various events.
	const ref = useRefWithEventListeners(active ? {
		mousedown: onDown,
		touchstart: onDown,
	} : {})

	// Transition the position
	position = {
		...position,
		x: useTransitionedValue(position.x, drag ? 0 : theme.transitions.duration.standard),
		y: useTransitionedValue(position.y, drag ? 0 : theme.transitions.duration.standard),
		r: useTransitionedValue(position.r, drag ? 0 : theme.transitions.duration.standard),
		m: useTransitionedValue(position.m, drag ? 0 : theme.transitions.duration.standard),
	}

	// Calculate the coordinates of the block, first in unity coordinates and then in SVG coordinates.
	const shapeCorners = shapes[index].map(corner => transformPoint(corner, position))
	const shapeCornersSvg = shapeCorners.map(corner => unityToSvg(corner))

	// Render the shape.
	const color = theme.palette.primary.main
	return <StyledPolygon ref={ref} active={active} selected={selected} points={shapeCornersSvg.map(corner => `${corner.x} ${corner.y}`).join(' ')} fill={color} />
}

const StyledPolygon = styled('polygon')(({ theme, active, selected }) => ({
	stroke: '#000000',
	strokeWidth: '1px',
	cursor: active ? 'grab' : 'default',
	fill: selected ? lighten(theme.palette.primary.main, 0.18) : theme.palette.primary.main,
	userSelect: 'none',
	WebkitTapHighlightColor: 'transparent',
	'&:hover': {
		fill: active ? lighten(theme.palette.primary.main, 0.25) : undefined,
	},
}))

const unityToSvg = (coords) => (coords === undefined ? undefined : {
	x: width / 2 + coords.x * f,
	y: height / 2 + coords.y * f,
})

const svgToUnity = (coords) => (coords === undefined ? undefined : {
	x: (coords.x - width / 2) / f,
	y: (coords.y - height / 2) / f,
})

const processDrag = (mousePosition, delta, index, positions) => {
	// Get orientation data.
	const positionIndex = positions.findIndex(position => position.i === index)
	const position = positions[positionIndex]

	// Find the new position.
	let newPosition = { ...position, ...subtract(mousePosition, delta) }

	// Bound the position to the frame.
	newPosition = constrainShape(newPosition, index)

	// Snap to a corner if there is a corner sufficiently close.
	const allCorners = getAllCorners([...positions.slice(0, positionIndex), ...positions.slice(positionIndex + 1)])
	const corners = shapes[index].map(corner => transformPoint(corner, newPosition))
	const squaredDistances = allCorners.map(c1 => corners.map(c2 => squaredDistance(c1, c2)))
	const minimalDistances = squaredDistances.map(list => Math.min(...list))
	if (Math.min(...minimalDistances) < snapThreshold ** 2) {
		const allCornersIndex = findMinimumIndex(minimalDistances)
		const cornerIndex = findMinimumIndex(squaredDistances[allCornersIndex])
		const delta = subtract(allCorners[allCornersIndex], corners[cornerIndex])
		newPosition = { ...newPosition, ...add(newPosition, delta) }
	}

	// Bound again, just in case.
	newPosition = constrainShape(newPosition, index)
	return newPosition
}

const transformPoint = (point, position) => {
	const angle = position.r * Math.PI / 4
	return {
		x: position.x + position.m * (point.x * Math.cos(angle) + point.y * Math.sin(angle)),
		y: position.y + (-point.x * Math.sin(angle) + point.y * Math.cos(angle)),
	}
}

const constrainShape = (newPosition, index) => {
	// Determine the bounds in unity coordinates.
	const maxX = (width / 2 - margin) / f
	const minX = -maxX
	const maxY = (height / 2 - margin) / f
	const minY = -maxY

	// Determine the current bounds for the shape and compare them with the actual bounds.
	const corners = shapes[index].map(corner => transformPoint(corner, newPosition))
	const bounds = getPointsBounds(corners)
	const shift = {
		x: Math.max(0, minX - bounds.minX) + Math.min(0, maxX - bounds.maxX),
		y: Math.max(0, minY - bounds.minY) + Math.min(0, maxY - bounds.maxY),
	}

	// On an issue, shift the position.
	if (shift.x !== 0 || shift.y !== 0)
		newPosition = { ...newPosition, ...add(newPosition, shift) }
	return newPosition
}

const getAllCorners = (positions) => {
	let allCorners = []
	positions.forEach(position => {
		const corners = shapes[position.i].map(corner => transformPoint(corner, position))
		allCorners = [...allCorners, ...corners]
	})
	return allCorners
}

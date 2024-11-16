import { useState, useRef, useEffect } from 'react'
import { useTheme, darken, lighten, styled } from '@mui/material/styles'
import { Rotate90DegreesCw as RotateIcon, Flip as FlipIcon } from '@mui/icons-material'
import Fab from '@mui/material/Fab'

import { useRefWithEventListeners } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'

// Set up settings for the Interface.
const width = 400
const height = 500
const margin = 10
const f = 70

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

	// Set up handlers to rotate/flip pieces.
	const rotate = (index, cw) => {
		const elementIndex = positions.findIndex(position => position.i === index)
		const oldPosition = positions[elementIndex]
		setPositions(positions => [...positions.slice(0, elementIndex), ...positions.slice(elementIndex + 1), { ...oldPosition, r: oldPosition.r + oldPosition.m * (cw ? -1 : 1) }])
	}
	const mirror = (index) => {
		const elementIndex = positions.findIndex(position => position.i === index)
		const oldPosition = positions[elementIndex]
		setPositions(positions => [...positions.slice(0, elementIndex), ...positions.slice(elementIndex + 1), { ...oldPosition, m: -oldPosition.m }])
	}

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

	// Check the value of the input.

	// Render the interface.
	return <>
		<Svg ref={svgRef} size={[width, height]} style={{ borderRadius: '1rem', overflow: 'visible', marginBottom: '0.4rem' }}>

			{/* Shapes. */}
			{positions.map(position => <Shape key={position.i} index={position.i} active={active} position={position} selected={selected === position.i} flipSelected={() => flipSelected(position.i)} />)}

			{/* Grading indicators. */}
			{/* ToDo */}

			{/* Rotation buttons. */}
			{/* ToDo */}

		</Svg>
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

function Shape({ index, active, position, selected, flipSelected }) {
	const theme = useTheme()

	// Set up listeners for various events.
	const ref = useRefWithEventListeners(active ? {
		click: () => flipSelected(),
	} : {})

	// Calculate the coordinates of the block, first in unity coordinates and then in SVG coordinates.
	const angle = position.r * Math.PI / 4
	const shapeCorners = shapes[index].map(corner => ({
		x: position.x + position.m * (corner.x * Math.cos(angle) + corner.y * Math.sin(angle)),
		y: position.y + (-corner.x * Math.sin(angle) + corner.y * Math.cos(angle)),
	}))
	const shapeCornersSvg = shapeCorners.map(corner => ({
		x: width / 2 + corner.x * f,
		y: height / 2 + corner.y * f,
	}))

	// Render the shape.
	const color = theme.palette.primary.main
	return <StyledPolygon ref={ref} active={active} selected={selected} points={shapeCornersSvg.map(corner => `${corner.x} ${corner.y}`).join(' ')} fill={color} />
}

const StyledPolygon = styled('polygon')(({ theme, active, selected }) => ({
	stroke: '#000000',
	strokeWidth: '1px',
	cursor: active ? 'grab' : 'default',
	fill: selected ? lighten(theme.palette.primary.main, 0.15) : theme.palette.primary.main,
	userSelect: 'none',
	WebkitTapHighlightColor: 'transparent',
	'&:hover': {
		fill: active ? lighten(theme.palette.primary.main, 0.25) : undefined,
	},
}))

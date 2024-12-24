import { useState, useRef } from 'react'
import { useTheme, darken, lighten } from '@mui/material/styles'

import { isUndefined, findOptimumIndex, useEventListener, useRefWithEventListeners, getEventPosition, useMousePosition, transformClientToSvg, useTransitionedValue, subtract, squaredDistance } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'

// Set up settings for the Interface.
const margin = 20
const size = 50 // Size of a square.
const borderRadius = 10
const gap = 8
const lightRadius = 12
const inBetween = 4 * gap // Between the last square and the first light.
const lightGap = gap // Between the lights.
const afterGap = gap // After the last light.
const verticalGap = gap
const verticalSplit = 3 * gap // Between the sums and the storage.

// Define number parameters.
const solutionRows = 3
const solutionCols = 3
const numInputs = solutionRows * solutionCols
const gridCols = 9
const gridRows = 2
const numStorage = gridRows * gridCols
const numLights = 2

// Define the input.
const exercises = [[2, 6], [2, 8], [2, 10]]
const exerciseRows = exercises.length
const exerciseCols = exercises[0].length
const numExerciseFields = exerciseRows * exerciseCols

const width = 2 * margin + gridCols * size + (gridCols - 1) * gap
const split = (width - 2 * margin - (exerciseCols + solutionCols) * size - inBetween - lightGap - afterGap - 2 * numLights * lightRadius) / (exerciseCols + solutionCols - 1) // For a plus or equals sign.
const height = 2 * margin + (gridRows + solutionRows) * size + ((solutionRows - 1) + (gridRows - 1)) * verticalGap + verticalSplit

// Define which numbers there are and where they start.
const numbers = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 18, 20, 24, 30, 36, 42, 50, 60]
const initialLocations = numbers.map(() => undefined)
const initialSolutions = new Array(solutionRows).fill(0).map(() => (new Array(numLights)).fill(undefined))

// Define where all the storage fields are.
const numIndexToCoords = (index) => {
	const col = index % gridCols
	const row = (index - col) / gridCols
	return {
		x: margin + col * (size + gap) + size / 2,
		y: margin + 3 * size + 2 * verticalGap + verticalSplit + row * (size + gap) + size / 2,
	}
}

// Define where the input fields are.
const inputIndexToCoords = (index) => {
	const col = index % solutionCols
	const row = (index - col) / solutionCols
	return {
		x: margin + (exerciseCols + col) * (size + split) + size / 2,
		y: margin + row * (size + verticalGap) + size / 2,
	}
}

// Define where the exercise fields are.
const exerciseIndexToCoords = (index) => {
	const col = index % exerciseCols
	const row = (index - col) / exerciseCols
	return {
		x: margin + col * (size + split) + size / 2,
		y: margin + row * (size + verticalGap) + size / 2,
	}
}

// Render the interface.
export function Interface({ submitAction, isCurrentAction }) {
	const active = isCurrentAction
	const theme = useTheme()
	const svgRef = useRef()
	const [locations, setLocations] = useRiddleStorage('historyDoorLocations', initialLocations)
	const [solutions, setSolutions] = useRiddleStorage('historyDoorSolutions', initialSolutions)

	// Track the mouse position.
	const mousePositionClient = useMousePosition()

	// Set up handlers for hovering/dragging.
	const [hovering, setHovering] = useState()
	const [dragging, setDragging] = useState()
	const mousePosition = transformClientToSvg(mousePositionClient, svgRef.current)
	const startDragging = (index, event) => {
		if (active) {
			const numLocation = locations[index]
			const dragLocation = transformClientToSvg(getEventPosition(event), svgRef.current)
			const blockCoords = isUndefined(numLocation) ? numIndexToCoords(index) : inputIndexToCoords(numLocation)
			const delta = subtract(dragLocation, blockCoords)
			setDragging({ index, delta })
			event.preventDefault()
		}
	}
	const endDragging = (event) => {
		if (dragging) {
			const endDragLocation = transformClientToSvg(getEventPosition(event), svgRef.current)
			const closestPosition = findClosestPosition(subtract(endDragLocation, dragging.delta), dragging.index)
			if (closestPosition === numInputs) { // Closest to own storage. Put it there.
				setLocations(locations => {
					locations = [...locations]
					locations[dragging.index] = undefined
					return locations
				})
			} else { // Closest to an input field. If there is something remove it. Put the new one in.
				setLocations(locations => {
					locations = [...locations]
					const currentlyInField = locations.findIndex(value => value === closestPosition)
					if (currentlyInField !== -1)
						locations[currentlyInField] = undefined
					locations[dragging.index] = closestPosition
					return locations
				})
			}
		}
		setDragging()
	}
	useEventListener(active ? ['mouseup', 'touchend'] : [], endDragging, window) // Listen to mouse-up on entire window.
	const closestPosition = (mousePosition && dragging) ? findClosestPosition(subtract(mousePosition, dragging.delta), dragging.index) : undefined

	// // Check the value of the input.
	// const correct = [
	// 	numbers[0] + numbers[1] + numbers[2] + numbers[3] === seed,
	// 	numbers[3] + numbers[4] + numbers[5] + numbers[6] === seed,
	// 	numbers[6] + numbers[7] + numbers[8] + numbers[9] === seed,
	// 	numbers[9] + numbers[10] + numbers[11] + numbers[0] === seed,
	// ]
	// const allCorrect = correct.every(value => value)
	// useEffect(() => {
	// 	if (allCorrect && isCurrentAction)
	// 		submitAction('unlockDoor')
	// }, [allCorrect, isCurrentAction, submitAction])

	// Set up a handler to render a block.
	const renderBlock = (index) => {
		const location = locations[index]
		return <Block
			key={index}
			index={isUndefined(location) ? index : location}
			value={numbers[index]}
			inStorage={isUndefined(location)}
			mousePosition={mousePosition}
			hover={hovering === index}
			drag={dragging?.index === index}
			delta={dragging?.delta}
			onDown={(event) => startDragging(index, event)}
			onHoverStart={() => setHovering(active && index)}
			onHoverEnd={() => setHovering()}
			closest={dragging && closestPosition === location}
			active={active}
		/>
	}

	// Render the interface.
	return <Svg ref={svgRef} size={[width, height]} style={{ borderRadius: '1rem', overflow: 'visible' }}>

		{/* The text symbols. */}
		<g transform={`translate(${margin}, ${margin})`}>
			{/* Pluses in the exercise data (left). */}
			{(new Array(exerciseRows)).fill(0).map((_, row) => (new Array(exerciseCols - 1)).fill(0).map((_, col) => <text key={`${col}:${row}`} x={(col + 1) * (size + split) - split / 2} y={row * (size + verticalGap) + size / 2} style={{ fontSize: '30px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#eee' }} transform="translate(0, 0)">+</text>)).flat()}
			{/* Equals signs. */}
			{exercises.map((_, index) => <text key={index} x={exerciseCols * (size + split) - split / 2} y={index * (size + verticalGap) + size / 2} style={{ fontSize: '30px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#eee' }} transform="translate(0, 0)">=</text>
			)}
			{/* Pluses in the input range (right). */}
			{(new Array(solutionRows)).fill(0).map((_, row) => (new Array(solutionCols - 1)).fill(0).map((_, col) => <text key={`${col}:${row}`} x={(exerciseCols + 1 + col) * (size + split) - split / 2} y={row * (size + verticalGap) + size / 2} style={{ fontSize: '30px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#eee' }} transform="translate(0, 0)">+</text>)).flat()}
		</g>

		{/* Lights. */}
		<g transform={`translate(${margin + (2 + solutionCols) * size + (1 + solutionCols) * split + inBetween}, ${margin})`}>
			{solutions.map((list, row) => list.map((value, col) => <circle key={`${col}:${row}`} cx={lightRadius + col * (2 * lightRadius + lightGap)} cy={size / 2 + row * (size + verticalGap)} r={lightRadius} fill={theme.palette[value ? 'success' : 'error'].main} />)).flat()}
		</g>

		{/* Block shades for when they are dragged away, first for storage and then for input. */}
		{locations.map((_, index) => <Block key={index} value={numbers[index]} index={index} inStorage={true} shade={true} closest={dragging?.index === index && closestPosition === numInputs} />)}
		{(new Array(numInputs)).fill(0).map((_, index) => <Block key={index} index={index} inStorage={false} shade={true} closest={closestPosition === index} />)}

		{/* The exercise field blocks. */}
		{new Array(numExerciseFields).fill(0).map((_, index) => <Block key={index} index={index} value={exercises.flat()[index]} isExercise={true} />)}

		{/* The actual blocks. Render the dragged one last to put it on top. */}
		{[...locations.map((_, index) => dragging?.index === index ? null : renderBlock(index)),
		dragging ? renderBlock(dragging.index) : null]}
	</Svg>
}

function findClosestPosition(coords, index) {
	const extraPosition = numIndexToCoords(index)
	const positions = [...(new Array(numInputs)).fill(0).map((_, index) => inputIndexToCoords(index)), extraPosition]
	const squaredDistances = positions.map((pCoords) => squaredDistance(coords, pCoords))
	return findOptimumIndex(squaredDistances, (a, b) => a < b)
}

function Block({ value, index, inStorage, isExercise, hover, drag, delta, shade, mousePosition, closest, onDown, onHoverStart, onHoverEnd, active }) {
	const theme = useTheme()

	// Set up listeners for various events.
	const ref = useRefWithEventListeners(active ? {
		mouseenter: onHoverStart,
		mouseleave: onHoverEnd,
		mousedown: onDown,
		touchstart: onDown,
	} : {})

	// Determine the coordinates where the number should be positioned.
	const coordsFunc = (inStorage ? numIndexToCoords : (isExercise ? exerciseIndexToCoords : inputIndexToCoords))
	const coords = (mousePosition && drag) ? subtract(mousePosition, delta) : coordsFunc(index)
	const easedCoords = {
		x: useTransitionedValue(coords?.x, drag ? 0 : theme.transitions.duration.standard),
		y: useTransitionedValue(coords?.y, drag ? 0 : theme.transitions.duration.standard),
	}

	// Render the block.
	const fill = theme.palette.primary.main
	if (!easedCoords)
		return null
	return <g ref={ref} transform={`translate(${easedCoords.x}, ${easedCoords.y})`} style={{ cursor: active ? 'grab' : 'default' }}>
		<rect key={`rect${value}`} x={-size / 2} y={-size / 2} width={size} height={size} rx={borderRadius} ry={borderRadius} fill={shade ? (closest ? darken(fill, 0.4) : darken(fill, 0.7)) : (hover || drag ? darken(fill, 0.4) : (closest ? lighten(fill, 0.2) : fill))} />
		{(shade && !inStorage) ? null : <Glyph key={`glyph${value}`} value={value} fade={shade && inStorage} />}
	</g>
}

const glyphStyle = { stroke: '#fff', strokeWidth: 2.5, fill: 'none' }
const oneWidth = 4
const tenWidth = 12
const maxWidth = 40
function Glyph({ value, fade }) {
	const ones = value % 10
	const tens = (value - ones) / 10
	const width = tens * tenWidth + ones * oneWidth
	const scale = Math.min(maxWidth / width, 1)

	return <g style={{ opacity: fade ? 0.1 : 1 }}>
		{/* Top bar. */}
		<g transform="translate(0,-8)">
			<path d="M-16 0 c10 8 20 8 32 0 c-10 -8 -20 -8 -32 0" style={glyphStyle} />
		</g>

		{/* Digits. */}
		<g transform={`translate(${-width * scale / 2}, 20) scale(${scale} 1)`}>
			{(new Array(tens)).fill(0).map((_, index) => <Ten key={`ten${index}`} transform={`translate(${(index + 0.5) * tenWidth}, 0)`} />)}
			{(new Array(ones)).fill(0).map((_, index) => <One key={`one${index}`} transform={`translate(${tens * tenWidth + (index + 0.5) * oneWidth}, 0)`} />)}
		</g>

		{/* Temporary number filler. */}
		{/* <text x={0} y={0} fill="#eee" style={{ fontSize: '30px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle', opacity: 0.2 }} transform="translate(0, 4)">{value}</text> */}
	</g>
}

const gh = 5 // Glyph half-height
const gw = 4 // Glyph half-width
function One({ transform }) {
	return <path d={`M0 -${gh} l0 -${2 * gh}`} style={glyphStyle} transform={transform} />
}
function Ten({ transform }) {
	return <path d={`M-${gw} -${gh} l0 -${gh} a${gw} ${gh} 0 0 1 ${2 * gw} 0 l0 ${gh}`} style={glyphStyle} transform={transform} />
}

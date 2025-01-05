import { useRef, useState, useEffect } from 'react'
import { useTheme, lighten, styled } from '@mui/material/styles'

import { lastOf, getRandomInteger, mod, useEventListener } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'

const f = Math.sqrt(2) / 2

// Set up settings for the Interface.
const gridSize = 7
const margin = 50 // Around the lock.
const squareSize = 50 // Size of a dial square.
const pointRadius = 20 // Radius of a point.
const squareGap = 2 // Between squares.
const squareRadius = 10 // Border radius of the squares.

const arrowHeight = 24
const arrowGap = 5 // Between a point and the arrow.
const arrowScale = arrowHeight / (squareSize / 2 + squareRadius)

const height = 2 * margin + gridSize * (squareSize + squareGap) - squareGap
const width = height

const indices = new Array(gridSize).fill(0).map((_, i) => i)

// Set up the initial value. Make sure it has at least two equal digits, so it can (after the random shuffle) never be correct.
const center = [3, 3]
const getInitialValue = (variant) => {
	if (variant === 0)
		return [[5, 3], [0, 0], [5, 0], [1, 3], [4, 4], [0, 5], [2, 6]]
	if (variant === 1)
		return [[2, 6], [2, 0], [0, 1], [4, 1], [4, 5], [1, 6], [6, 6]]
	if (variant === 2)
		return [[5, 4], [6, 0], [0, 1], [1, 1], [6, 1], [1, 2], [2, 5]]
}

export function Interface({ state, submitAction, isCurrentAction }) {
	const active = isCurrentAction
	const theme = useTheme()
	const svgRef = useRef()
	const variant = (state.hallRiddlesSolved || 0)
	const [positions, setPositions] = useRiddleStorage(`hallRiddle${variant}`, [getInitialValue(variant)])
	const [activePoint, setActivePoint] = useState(undefined)

	let currPositions = lastOf(positions)
	if (!state.chairsGathered)
		currPositions = [currPositions[0]]

	// On a click not on a circle, deactivate any point.
	const deactivatePoint = (event) => {
		if (!event || (event.target.tagName !== 'circle' && event.target.tagName !== 'path'))
			setActivePoint()
	}
	useEventListener(active ? ['mousedown', 'touchstart'] : [], deactivatePoint, svgRef)
	const activePosition = activePoint && positions[activePoint]

	// Set up handlers to implement movement.
	const move = (pointIndex, dir) => {
		deactivatePoint()
		setPositions(positions => {
			let currPositions = lastOf(positions)
			const pointPosition = currPositions[pointIndex]

			// Determine where the point will end up without blocked movement.
			const horizontal = (dir % 2 === 1)
			const positive = (dir >= 1 && dir <= 2)
			let endCoord = (positive ? gridSize : -1)

			// Find another point that might block movement.
			if (state.chairsGathered) {
				currPositions.forEach(position => {
					if (horizontal) {
						if (pointPosition[1] === position[1] && (positive ? (pointPosition[0] < position[0]) : (pointPosition[0] > position[0])))
							endCoord = position[0] + (positive ? -1 : 1)
					} else {
						if (pointPosition[0] === position[0] && (positive ? (pointPosition[1] < position[1]) : (pointPosition[1] > position[1])))
							endCoord = position[1] + (positive ? -1 : 1)
					}
				})
			}

			// Determine the new position. On no change, do not add to the history.
			const newPosition = (horizontal ? [endCoord, pointPosition[1]] : [pointPosition[0], endCoord])
			if (newPosition[0] === pointPosition[0] && newPosition[1] === pointPosition[1])
				return positions

			// Add the new set-up to the history.
			currPositions = [...currPositions]
			currPositions[pointIndex] = newPosition
			positions = [...positions, currPositions]
			return positions
		})
	}

	// // Set up handlers to change the value.
	// const increment = (index) => {
	// 	if (!active)
	// 		return
	// 	setValue(value => {
	// 		value = [...value]
	// 		value[index] = mod(value[index] + 1, 10)
	// 		return value
	// 	})
	// }
	// const decrement = (index) => {
	// 	if (!active)
	// 		return
	// 	setValue(value => {
	// 		value = [...value]
	// 		value[index] = mod(value[index] - 1, 10)
	// 		return value
	// 	})
	// }

	// // Do the grading of the outcome.
	// const isCorrect = solution.every((solutionValue, index) => seed2[solutionValue] === value[index])
	// useEffect(() => {
	// 	if (isCorrect && isCurrentAction)
	// 		submitAction({ type: 'unlockDoor', to: 'Music' })
	// }, [isCorrect, isCurrentAction, submitAction])

	// Render the interface.
	return <>
		<Svg ref={svgRef} size={[width, height]} style={{ borderRadius: '1rem', overflow: 'visible', marginBottom: '0.4rem' }}>
			<g transform={`translate(${margin}, ${margin})`}>
				{/* Grid. */}
				{indices.map(col => indices.map(row => <rect key={`${col}:${row}`} x={col * (squareSize + squareGap)} y={row * (squareSize + squareGap)} width={squareSize} height={squareSize} rx={squareRadius} ry={squareRadius} fill={theme.palette[isCenter([col, row]) ? 'success' : 'primary'].main} style={{ opacity: 0.3 }} />))}

				{/* Points. */}
				{currPositions.map((position, index) => <g key={index} transform={`translate(${position[0] * (squareSize + squareGap) + squareSize / 2}, ${position[1] * (squareSize + squareGap) + squareSize / 2})`}>
					<StyledCircle cx={0} cy={0} r={pointRadius} active={active} isMain={index === 0} isActive={index === activePoint} onClick={() => index === activePoint
						? deactivatePoint() : setActivePoint(index)} />

					{/* Arrows when active. */}
					{activePoint === index && active ? <g>
						<StyledPath transform={`translate(${0} ${-squareSize / 2}) rotate(180) scale(1, ${arrowScale})`} d={`M0 0 h${-pointRadius + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${pointRadius - squareRadius} ${pointRadius - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${pointRadius - squareRadius} ${-(pointRadius - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-pointRadius + squareRadius}`} isMain={index === 0} onClick={() => move(index, 0)} />
						<StyledPath transform={`translate(${squareSize / 2} ${0}) rotate(270) scale(1, ${arrowScale})`} d={`M0 0 h${-pointRadius + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${pointRadius - squareRadius} ${pointRadius - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${pointRadius - squareRadius} ${-(pointRadius - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-pointRadius + squareRadius}`} isMain={index === 0} onClick={() => move(index, 1)} />
						<StyledPath transform={`translate(${0} ${squareSize / 2}) rotate(0) scale(1, ${arrowScale})`} d={`M0 0 h${-pointRadius + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${pointRadius - squareRadius} ${pointRadius - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${pointRadius - squareRadius} ${-(pointRadius - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-pointRadius + squareRadius}`} isMain={index === 0} onClick={() => move(index, 2)} />
						<StyledPath transform={`translate(${-squareSize / 2} ${0}) rotate(90) scale(1, ${arrowScale})`} d={`M0 0 h${-pointRadius + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${pointRadius - squareRadius} ${pointRadius - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${pointRadius - squareRadius} ${-(pointRadius - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-pointRadius + squareRadius}`} isMain={index === 0} onClick={() => move(index, 3)} />
					</g> : null}
				</g>)}
			</g>
		</Svg>
	</>
}

function isCenter(point) {
	return point[0] === center[0] && point[1] === center[1]
}

const StyledCircle = styled('circle')(({ theme, isMain, active, isActive }) => {
	const color = theme.palette[isMain ? 'success' : 'primary'].main
	return {
		fill: isActive ? lighten(color, 0.4) : color,
		userSelect: 'none',
		cursor: active ? 'pointer' : undefined,
		WebkitTapHighlightColor: 'transparent',
		'&:hover': {
			fill: active ? lighten(color, 0.2) : undefined,
		},
	}
})

const StyledPath = styled('path')(({ theme, isMain }) => {
	const color = theme.palette[isMain ? 'success' : 'primary'].main
	return {
		fill: lighten(color, 0.4),
		userSelect: 'none',
		cursor: 'pointer',
		WebkitTapHighlightColor: 'transparent',
		'&:hover': {
			fill: lighten(color, 0.2),
		},
	}
})

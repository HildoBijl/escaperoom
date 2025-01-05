import { useRef, useState, useEffect } from 'react'
import { useTheme, darken, lighten, styled } from '@mui/material/styles'
import { Undo as UndoIcon, Replay as ResetIcon } from '@mui/icons-material'
import Fab from '@mui/material/Fab'

import { lastOf, useEventListener, useTransitionedValue } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'

const f = Math.sqrt(2) / 2

// Set up settings for the Interface.
const gridSize = 7
const margin = 56 // Around the lock.
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
	const activatePoint = index => {
		if (!isPositionDown(currPositions[index]))
			return setActivePoint(index)
	}
	const activePosition = activePoint === undefined ? undefined : currPositions[activePoint]

	// Set up a handler to implement movement.
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
				console.log(currPositions, pointPosition)
				currPositions.forEach(position => {
					if (horizontal) {
						if (pointPosition[1] === position[1] && (positive ? (pointPosition[0] < position[0] && position[0] <= endCoord) : (pointPosition[0] > position[0] && position[0] >= endCoord)))
							endCoord = position[0] + (positive ? -1 : 1)
					} else {
						if (pointPosition[0] === position[0] && (positive ? (pointPosition[1] < position[1] && position[1] <= endCoord) : (pointPosition[1] > position[1] && position[1] >= endCoord)))
							endCoord = position[1] + (positive ? -1 : 1)
					}
				})
				console.log(endCoord)
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

	// Set up undo/reset handlers.
	const undo = () => {
		setPositions(positions => positions.length === 1 ? positions : positions.slice(0, -1))
	}
	const reset = () => {
		setPositions(positions => [positions[0]])
	}

	// Do the grading of the outcome.
	const isCorrect = isCenter(currPositions[0])
	useEffect(() => {
		if (isCorrect && isCurrentAction)
			setTimeout(() => submitAction({ type: 'solveRiddle' }), 2 * theme.transitions.duration.standard)
	}, [theme, isCorrect, isCurrentAction, submitAction])

	// Render the interface.
	return <>
		<Svg ref={svgRef} size={[width, height]} style={{ borderRadius: '1rem', overflow: 'visible', marginBottom: '0.4rem' }}>
			<g transform={`translate(${margin}, ${margin})`}>
				{/* Grid. */}
				{indices.map(col => indices.map(row => <rect key={`${col}:${row}`} x={col * (squareSize + squareGap)} y={row * (squareSize + squareGap)} width={squareSize} height={squareSize} rx={squareRadius} ry={squareRadius} fill={theme.palette[isCenter([col, row]) ? 'success' : 'primary'].main} style={{ opacity: 0.3 }} />))}

				{/* Points. */}
				{currPositions.map((position, index) => <Point key={index} index={index} position={position} isActive={index === activePoint} {...{ active, activatePoint, deactivatePoint }} />)}

				{/* Arrows when active. */}
				{activePosition && active ? <g transform={`translate(${activePosition[0] * (squareSize + squareGap) + squareSize / 2}, ${activePosition[1] * (squareSize + squareGap) + squareSize / 2})`}>
					<StyledPath transform={`translate(${0} ${-squareSize / 2}) rotate(180) scale(1, ${arrowScale})`} d={`M0 0 h${-pointRadius + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${pointRadius - squareRadius} ${pointRadius - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${pointRadius - squareRadius} ${-(pointRadius - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-pointRadius + squareRadius}`} isMain={activePoint === 0} onClick={() => move(activePoint, 0)} />
					<StyledPath transform={`translate(${squareSize / 2} ${0}) rotate(270) scale(1, ${arrowScale})`} d={`M0 0 h${-pointRadius + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${pointRadius - squareRadius} ${pointRadius - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${pointRadius - squareRadius} ${-(pointRadius - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-pointRadius + squareRadius}`} isMain={activePoint === 0} onClick={() => move(activePoint, 1)} />
					<StyledPath transform={`translate(${0} ${squareSize / 2}) rotate(0) scale(1, ${arrowScale})`} d={`M0 0 h${-pointRadius + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${pointRadius - squareRadius} ${pointRadius - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${pointRadius - squareRadius} ${-(pointRadius - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-pointRadius + squareRadius}`} isMain={activePoint === 0} onClick={() => move(activePoint, 2)} />
					<StyledPath transform={`translate(${-squareSize / 2} ${0}) rotate(90) scale(1, ${arrowScale})`} d={`M0 0 h${-pointRadius + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${pointRadius - squareRadius} ${pointRadius - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${pointRadius - squareRadius} ${-(pointRadius - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-pointRadius + squareRadius}`} isMain={activePoint === 0} onClick={() => move(activePoint, 3)} />
				</g> : null}
			</g>
		</Svg>

		{/* Undo/reset buttons. */}
		{active ? <div style={{ display: 'flex', flexFlow: 'row nowrap', justifyContent: 'center', gap: '1rem', }}>
			<Fab color="primary" disabled={positions.length === 1} onClick={() => undo()}>
				<UndoIcon />
			</Fab>
			<Fab color="primary" disabled={positions.length === 1} onClick={() => reset()}>
				<ResetIcon />
			</Fab>
		</div> : null}
	</>
}

function Point({ index, position, isActive, active, activatePoint, deactivatePoint }) {
	const theme = useTheme()
	const svgCoords = {
		x: position[0] * (squareSize + squareGap) + squareSize / 2,
		y: position[1] * (squareSize + squareGap) + squareSize / 2,
	}
	const transitionedCoords = {
		x: useTransitionedValue(svgCoords.x, theme.transitions.duration.standard),
		y: useTransitionedValue(svgCoords.y, theme.transitions.duration.standard),
	}

	return <g transform={`translate(${transitionedCoords.x}, ${transitionedCoords.y})`}>
		<StyledCircle cx={0} cy={0} r={pointRadius} active={active} isMain={index === 0} isActive={isActive} onClick={() => isActive
			? deactivatePoint() : activatePoint(index)} isDown={isPositionDown(position)} />
	</g>
}

function isCenter(point) {
	return point[0] === center[0] && point[1] === center[1]
}

const StyledCircle = styled('circle')(({ theme, isMain, active, isActive, isDown }) => {
	const color = theme.palette[isMain ? 'success' : 'primary'].main
	return {
		fill: isDown ? darken(color, 0.6) : (isActive ? lighten(color, 0.4) : color),
		userSelect: 'none',
		cursor: active && !isDown ? 'pointer' : undefined,
		WebkitTapHighlightColor: 'transparent',
		transition: `fill ${theme.transitions.duration.standard}ms`,
		'&:hover': {
			fill: active && !isDown ? lighten(color, 0.2) : undefined,
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

const isPositionDown = position => {
	return position[0] === -1 || position[1] === -1 || position[0] === gridSize || position[1] === gridSize
}

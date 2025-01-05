import { useRef, useState, useEffect } from 'react'
import { useTheme, lighten, styled } from '@mui/material/styles'

import { getRandomInteger, mod, useEventListener } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'

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
	let [positions, setPositions] = useRiddleStorage(`hallRiddle${variant}`, getInitialValue(variant))
	const [activePoint, setActivePoint] = useState(undefined)

	if (!state.chairsGathered)
		positions = [positions[0]]

	// On a click not on a circle, deactivate any point.
	const deactivatePoint = (event) => {
		if (event.target.tagName !== 'circle')
			setActivePoint()
	}
	useEventListener(active ? ['mousedown', 'touchstart'] : [], deactivatePoint, svgRef)


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
				{positions.map((position, index) => <g key={index} transform={`translate(${position[0] * (squareSize + squareGap) + squareSize / 2}, ${position[1] * (squareSize + squareGap) + squareSize / 2})`}>
					<StyledCircle cx={0} cy={0} r={pointRadius} active={active} isMain={index === 0} isActive={index === activePoint} onClick={() => setActivePoint(index)} />
				</g>)}
			</g>

			{/* Arrows. */}
			{/* <g transform={`translate(${0}, ${arrowHeight}) scale(1, ${-arrowScale})`}>
					{value.map((_, index) => <StyledPath key={index} transform={`translate(${(squareSize + squareGap) * index} 0)`} active={active} d={`M${squareSize / 2} 0 h${-squareSize / 2 + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${squareSize / 2 - squareRadius} ${squareSize / 2 - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${squareSize / 2 - squareRadius} ${-(squareSize / 2 - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-squareSize / 2 + squareRadius}`} style={{ cursor: active ? 'pointer' : 'default' }} onClick={() => increment(index)} />)}
				</g>
				<g transform={`translate(${0}, ${arrowHeight + 2 * arrowGap + squareSize}) scale(1, ${arrowScale})`}>
					{value.map((_, index) => <StyledPath key={index} transform={`translate(${(squareSize + squareGap) * index} 0)`} active={active} d={`M${squareSize / 2} 0 h${-squareSize / 2 + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${squareSize / 2 - squareRadius} ${squareSize / 2 - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${squareSize / 2 - squareRadius} ${-(squareSize / 2 - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-squareSize / 2 + squareRadius}`} style={{ cursor: active ? 'pointer' : 'default' }} onClick={() => decrement(index)} />)}
				</g> */}
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
			fill: active && !isActive ? lighten(color, 0.2) : undefined,
		},
	}
})

const StyledPath = styled('path')(({ theme, active }) => ({
	fill: theme.palette.primary.main,
	userSelect: 'none',
	WebkitTapHighlightColor: 'transparent',
	'&:hover': {
		fill: active ? lighten(theme.palette.primary.main, 0.2) : undefined,
	},
}))

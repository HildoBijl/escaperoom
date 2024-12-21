import { useRef, useEffect } from 'react'
import { useTheme, lighten, styled } from '@mui/material/styles'

import { getRandomInteger, mod } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'

const f = Math.sqrt(2) / 2

// Set up settings for the Interface.
const margin = 20 // Around the lock.
const squareSize = 50 // Size of a dial square.
const squareGap = 8 // Between squares.
const squareRadius = 10 // Border radius of the squares.
const interGap = margin // Between the squares and the feedback.
const lightGap = squareGap // Between lights.
const lightRadius = squareSize / 5 // Radius of the feedback lights.

const inputGap = 15 // Between the last square and the input.
const arrowHeight = 24
const arrowGap = 5 // Between the arrow and the square.
const arrowScale = arrowHeight / (squareSize / 2 + squareRadius)

const height = 2 * margin + 5 * squareSize + 4 * squareGap + inputGap + 2 * arrowHeight + 2 * arrowGap + squareSize
const width = 2 * margin + 3 * squareSize + 2 * squareGap + interGap + 3 * 2 * lightRadius + 2 * lightGap

// Define the shapes and their initial positions.
const solution = [0, 4, 2]
const examples = [[7, 3, 8], [6, 1, 4], [7, 8, 0], [2, 0, 6], [6, 8, 2]]
const examplesResults = [[0, 0], [0, 1], [0, 1], [0, 2], [1, 0]]

// Set up the initial value. Make sure it has at least two equal digits, so it can (after the random shuffle) never be correct.
const getInitialValue = () => {
	const initialValue = solution.map(() => getRandomInteger(0, 9))
	if (!initialValue.some((value, index) => initialValue.some((otherValue, otherIndex) => value === otherValue && index !== otherIndex)))
		return getInitialValue()
	return initialValue
}
const initialValue = getInitialValue()

export function Interface({ state, submitAction, isCurrentAction }) {
	const active = isCurrentAction
	const theme = useTheme()
	const svgRef = useRef()
	const [value, setValue] = useRiddleStorage('mathsDoor2Digits', initialValue)
	const { seed1, seed2 } = state.musicDoor

	// Set up handlers to change the value.
	const increment = (index) => {
		if (!active)
			return
		setValue(value => {
			value = [...value]
			value[index] = mod(value[index] + 1, 10)
			return value
		})
	}
	const decrement = (index) => {
		if (!active)
			return
		setValue(value => {
			value = [...value]
			value[index] = mod(value[index] - 1, 10)
			return value
		})
	}

	// Do the grading of the outcome.
	const isCorrect = solution.every((solutionValue, index) => seed2[solutionValue] === value[index])
	useEffect(() => {
		if (isCorrect && isCurrentAction)
			submitAction({ type: 'unlockDoor', to: 'Music' })
	}, [isCorrect, isCurrentAction, submitAction])

	// Render the interface.
	return <>
		<Svg ref={svgRef} size={[width, height]} style={{ borderRadius: '1rem', overflow: 'visible', marginBottom: '0.4rem' }}>
			{/* Example data. */}
			{seed1.map((exampleIndex, seedIndex) => {
				const example = examples[exampleIndex]
				const results = examplesResults[exampleIndex]
				const lights = [...(new Array(results[0]).fill(true)), ...(new Array(results[1]).fill(false))]
				return <g key={seedIndex} transform={`translate(${margin}, ${margin + (squareSize + squareGap) * seedIndex})`}>

					{/* Squares and digits. */}
					{example.map((digit, digitIndex) => <g key={digitIndex} transform={`translate(${(squareSize + squareGap) * digitIndex}, ${0})`}>
						<rect x={0} y={0} width={squareSize} height={squareSize} rx={squareRadius} ry={squareRadius} fill={theme.palette.primary.main} />
						<text x={squareSize / 2} y={squareSize / 2} fill="#eee" style={{ fontSize: '24px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle' }} transform="translate(0, 2)">{seed2[digit]}</text>
					</g>)}

					{/* Lights. */}
					{lights.map((light, lightIndex) => <circle key={lightIndex} cx={squareSize * 3 + squareGap * 2 + interGap + lightRadius + (2 * lightRadius + lightGap) * lightIndex} cy={squareSize / 2} r={lightRadius} fill={theme.palette[light ? 'success' : 'warning'].main} />)}
				</g>
			})}

			{/* Input. */}
			<g transform={`translate(${margin}, ${margin + squareSize * 5 + squareGap * 4 + inputGap})`}>
				{/* Digits and lights. */}
				<g transform={`translate(${0}, ${arrowHeight + arrowGap})`}>
					{/* Digits. */}
					{value.map((digit, digitIndex) => <g key={digitIndex} transform={`translate(${(squareSize + squareGap) * digitIndex}, ${0})`}>
						<rect x={0} y={0} width={squareSize} height={squareSize} rx={squareRadius} ry={squareRadius} fill={theme.palette.primary.main} />
						<text x={squareSize / 2} y={squareSize / 2} fill="#eee" style={{ fontSize: '24px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle' }} transform="translate(0, 2)">{digit}</text>
					</g>)}

					{/* Lights. */}
					{isCorrect ? [true, true, true].map((light, lightIndex) => <circle key={lightIndex} cx={squareSize * 3 + squareGap * 2 + interGap + lightRadius + (2 * lightRadius + lightGap) * lightIndex} cy={squareSize / 2} r={lightRadius} fill={theme.palette[light ? 'success' : 'warning'].main} />) : null}
				</g>

				{/* Arrows. */}
				<g transform={`translate(${0}, ${arrowHeight}) scale(1, ${-arrowScale})`}>
					{value.map((_, index) => <StyledPath key={index} transform={`translate(${(squareSize + squareGap) * index} 0)`} active={active} d={`M${squareSize / 2} 0 h${-squareSize / 2 + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${squareSize / 2 - squareRadius} ${squareSize / 2 - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${squareSize / 2 - squareRadius} ${-(squareSize / 2 - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-squareSize / 2 + squareRadius}`} style={{ cursor: active ? 'pointer' : 'default' }} onClick={() => increment(index)} />)}
				</g>
				<g transform={`translate(${0}, ${arrowHeight + 2 * arrowGap + squareSize}) scale(1, ${arrowScale})`}>
					{value.map((_, index) => <StyledPath key={index} transform={`translate(${(squareSize + squareGap) * index} 0)`} active={active} d={`M${squareSize / 2} 0 h${-squareSize / 2 + squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${squareRadius * (1 + f)} l${squareSize / 2 - squareRadius} ${squareSize / 2 - squareRadius} a${squareRadius} ${squareRadius} 0 0 0 ${squareRadius * 2 * f} 0 l${squareSize / 2 - squareRadius} ${-(squareSize / 2 - squareRadius)} a${squareRadius} ${squareRadius} 0 0 0 ${-squareRadius * f} ${-squareRadius * (1 + f)} h${-squareSize / 2 + squareRadius}`} style={{ cursor: active ? 'pointer' : 'default' }} onClick={() => decrement(index)} />)}
				</g>
			</g>
		</Svg>
	</>
}

const StyledPath = styled('path')(({ theme, active }) => ({
	fill: theme.palette.primary.main,
	userSelect: 'none',
	WebkitTapHighlightColor: 'transparent',
	'&:hover': {
		fill: active ? lighten(theme.palette.primary.main, 0.2) : undefined,
	},
}))

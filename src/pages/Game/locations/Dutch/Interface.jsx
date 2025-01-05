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

const arrowHeight = 30
const arrowGap = 5 // Between the arrow and the square.
const arrowScale = arrowHeight / (squareSize / 2 + squareRadius)

const height = 2 * margin + squareSize + 2 * arrowHeight + 2 * arrowGap
const width = 2 * margin + 4 * squareSize + 3 * squareGap

// Define the shapes and their initial positions.
const solution = [0, 0, 2, 4]

// Set up the initial value. Make sure all digits are different, so it can never be correct.
const getInitialValue = () => {
	const initialValue = solution.map(() => getRandomInteger(0, 9))
	if (initialValue.some((value, index) => initialValue.some((otherValue, otherIndex) => value === otherValue && index !== otherIndex)))
		return getInitialValue()
	return initialValue
}
const initialValue = getInitialValue()

export function Interface({ state, submitAction, isCurrentAction }) {
	const active = isCurrentAction
	const theme = useTheme()
	const svgRef = useRef()
	const [value, setValue] = useRiddleStorage('dutchDoor', initialValue)
	const { seed } = state.dutchDoor

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
	const isCorrect = solution.every((solutionValue, index) => solutionValue === seed[value[index]])
	useEffect(() => {
		if (isCorrect && isCurrentAction)
			setTimeout(() => submitAction('unlockDoor'), 2 * theme.transitions.duration.standard)
	}, [theme, isCorrect, isCurrentAction, submitAction])

	// Render the interface.
	return <>
		<Svg ref={svgRef} size={[width, height]} style={{ borderRadius: '1rem', overflow: 'visible', marginBottom: '0.4rem' }}>
			{/* Input. */}
			<g transform={`translate(${margin}, ${margin})`}>
				{/* Digits and lights. */}
				<g transform={`translate(${0}, ${arrowHeight + arrowGap})`}>
					{/* Digits. */}
					{value.map((digit, digitIndex) => <g key={digitIndex} transform={`translate(${(squareSize + squareGap) * digitIndex}, ${0})`}>
						<rect x={0} y={0} width={squareSize} height={squareSize} rx={squareRadius} ry={squareRadius} fill={theme.palette.primary.main} />
						<Glyph digit={seed[digit]} />
					</g>)}
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

const ss = 10 // Square size
const ds = 14 // Diamond size
function Glyph({ digit }) {

	return <g transform={`translate(${squareSize / 2}, ${squareSize / 2})`}>
		{/* Path */}
		<path d={getDigitPath(digit)} stroke="#eee" strokeWidth="3" fill="none" />

		{/* Dot */}
		{hasDot(digit) ? <circle cx={0} cy={0} r={5} fill="#eee" /> : null}

		{/* Text back-up */}
		{/* <text x={0} y={0} fill="#eee" style={{ fontSize: '24px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle', opacity: 0.2 }} transform="translate(0, 2)">{digit}</text> */}
	</g>
}

function isSquare(digit) {
	digit = String(digit).toLowerCase()
	if (['j', 'k', 'l', 'm'].includes(digit))
		return false
	if (['w', 'x', 'y', 'z'].includes(digit))
		return false
	if (!isNaN(digit))
		return false
	return true
}

function hasDot(digit) {
	digit = String(digit).toLowerCase()
	if (['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'].includes(digit))
		return false
	if (!isNaN(digit) && digit >= 1 && digit <= 5)
		return false
	return true
}

function getDigitPath(digit) {
	return getStartEndPath(getStartEnd(digit), isSquare(digit))
}

function getStartEnd(digit) {
	digit = String(digit).toLowerCase()
	if (['a', 'n', 'j', 'w'].includes(digit))
		return [1, 2]
	if (['b', 'o', '2', '7'].includes(digit))
		return [1, 3]
	if (['c', 'p', 'l', 'y'].includes(digit))
		return [2, 3]
	if (['d', 'q', '1', '6'].includes(digit))
		return [0, 2]
	if (['e', 'r', '3', '8'].includes(digit))
		return [0, 3]
	if (['f', 's', '5', '0'].includes(digit))
		return [2, 4]
	if (['g', 't', 'k', 'x'].includes(digit))
		return [0, 1]
	if (['h', 'u', '4', '9'].includes(digit))
		return [3, 5]
	if (['i', 'v', 'm', 'z'].includes(digit))
		return [4, 5]
}

function getStartEndPath(startEnd, square) {
	const [start, end] = startEnd
	const pointToCoords = square ? squarePointToCoords : diamondPointToCoords
	const points = new Array(end - start + 2).fill(0).map((_, index) => start + index)
	const coords = points.map(point => pointToCoords(point))
	return `M${coords.join('L')}${end - start === 3 ? 'Z' : ''}`
}

function diamondPointToCoords(point) {
	point = point % 4
	if (point === 0)
		return `0 ${-ds}`
	if (point === 1)
		return `${ds} 0`
	if (point === 2)
		return `0 ${ds}`
	if (point === 3)
		return `${-ds} 0`
}

function squarePointToCoords(point) {
	if (point === 0)
		return `${-ss} ${-ss}`
	if (point === 1)
		return `${ss} ${-ss}`
	if (point === 2)
		return `${ss} ${ss}`
	if (point === 3)
		return `${-ss} ${ss}`
}

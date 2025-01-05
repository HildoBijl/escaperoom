import { useState, useRef, useEffect } from 'react'
import { useTheme, darken, lighten } from '@mui/material/styles'

import { getFactorization, useRefWithEventListeners } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'

// Set up settings for the Interface.
const width = 8, height = 8
const initialNumbers = (new Array(width * height)).fill(false)
const size = 40
const margin = 12
const gap = 12
const radius = 10
const offset = 1
const blockMargin = 5
const containerRadius = radius + blockMargin - 2
const containerParameters = { rx: containerRadius, ry: containerRadius, style: { opacity: 0.4 } }
const groups = [[0, 2 * width - 1], [2 * width, 4 * width - 1], [4 * width, 6 * width - 1], [6 * width, 8 * width - 1]]

export function Interface({ submitAction, isCurrentAction }) {
	const active = isCurrentAction
	const theme = useTheme()
	const svgRef = useRef()
	const [numbers, setNumbers] = useRiddleStorage('mathsDoor1', initialNumbers)

	// Set up handlers to adjust the state.
	const flipNumber = (num) => {
		setNumbers(numbers => {
			numbers = [...numbers]
			numbers[num] = !numbers[num]
			return numbers
		})
	}

	// Check the value of the input.
	const correct = groups.map(group => areNumbersCorrect(numbers.slice(group[0], group[1] + 1), group[0] + offset))
	const allCorrect = correct.every(value => value)
	useEffect(() => {
		if (allCorrect && isCurrentAction)
			setTimeout(() => submitAction({ type: 'unlockDoor', to: 'History' }), 2 * theme.transitions.duration.standard)
	}, [theme, allCorrect, isCurrentAction, submitAction])

	// Render the interface.
	const getContainerColor = correct => correct ? darken(theme.palette.success.main, 0) : darken(theme.palette.primary.main, 1)
	return <Svg ref={svgRef} size={8 * size + 7 * gap + 2 * margin} style={{ borderRadius: '1rem', overflow: 'visible' }}>

		{/* Feedback rectangles. */}
		{groups.map((group, index) => {
			const start = getPosition(group[0]), end = getPosition(group[1])
			return <rect key={index} x={start.x - size / 2 - blockMargin} y={start.y - size / 2 - blockMargin} width={end.x - start.x + size + 2 * blockMargin} height={end.y - start.y + size + 2 * blockMargin} {...containerParameters} fill={getContainerColor(correct[index])} />
		})}

		{/* All number blocks. */}
		{[...numbers.map((activated, num) => <Block key={num} num={num} activated={activated} flip={() => flipNumber(num)} active={active} />)]}

	</Svg>
}

function Block({ num, activated, flip, active }) {
	const theme = useTheme()
	const [hover, setHover] = useState(false)

	// Set up listeners for various events.
	const ref = useRefWithEventListeners(active ? {
		mouseenter: () => setHover(true),
		mouseleave: () => setHover(false),
		click: () => flip(),
	} : {})

	// Render the block.
	const coords = getPosition(num)
	let fill = activated ? theme.palette.success.main : theme.palette.primary.main
	if (active && hover)
		fill = lighten(fill, 0.2)
	return <g ref={ref} transform={`translate(${coords.x}, ${coords.y})`} style={{ cursor: active ? 'pointer' : 'default' }}>
		<rect key={num} x={-size / 2} y={-size / 2} width={size} height={size} rx={radius} ry={radius} fill={fill} />
		<text x={0} y={0} fill="#eee" style={{ fontSize: '16px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle' }} transform="translate(0, 2)">{num + offset}</text>
	</g>
}

function getPosition(num) {
	const col = num % width
	const row = (num - col) / width
	return {
		x: margin + (size + gap) * col + size / 2,
		y: margin + (size + gap) * row + size / 2,
	}
}

function getNumPrimeFactors(num) {
	return getFactorization(num).reduce((sum, value) => sum + value, 0)
}

function hasTwoPrimeFactors(num) {
	return getNumPrimeFactors(num) === 2
}

function areNumbersCorrect(numbers, offset) {
	return numbers.every((activated, index) => activated === hasTwoPrimeFactors(index + offset))
}

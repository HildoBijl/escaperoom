import { useState, useRef, useEffect } from 'react'
import { useTheme, darken, lighten } from '@mui/material/styles'

import { getFactorization, findOptimumIndex, useEventListener, useRefWithEventListeners, getEventPosition, useMousePosition, transformClientToSvg, useTransitionedValue } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'


// Set up settings for the Interface.
const width = 8, height = 8
const initialNumbers = (new Array(width * height)).fill(false)
const size = 40
const margin = 12
const gap = 8
const radius = 10

export function Interface({ state, submitAction, isCurrentAction }) {
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

	// Render the interface.
	const getContainerColor = correct => correct ? darken(theme.palette.success.main, 0.3) : darken(theme.palette.primary.main, 0.3)
	return <Svg ref={svgRef} size={8 * size + 7 * gap + 2 * margin} style={{ borderRadius: '1rem', overflow: 'visible' }}>

		{/* Feedback rectangles. */}
		{/* <rect x={margin - marginShort} y={margin - marginLong} width={size + 2 * marginShort} height={4 * size + 3 * gap + 2 * marginLong} {...containerParameters} stroke={getContainerColor(correct[3])} />
		<rect x={margin + 3 * (size + gap) - marginShort} y={margin - marginLong} width={size + 2 * marginShort} height={4 * size + 3 * gap + 2 * marginLong} {...containerParameters} stroke={getContainerColor(correct[1])} />
		<rect x={margin - marginLong} y={margin - marginShort} width={4 * size + 3 * gap + 2 * marginLong} height={size + 2 * marginShort} rx={radius} {...containerParameters} stroke={getContainerColor(correct[0])} />
		<rect x={margin - marginLong} y={margin + 3 * (size + gap) - marginShort} width={4 * size + 3 * gap + 2 * marginLong} height={size + 2 * marginShort} {...containerParameters} stroke={getContainerColor(correct[2])} /> */}

		{/* Block shades for when they are dragged away. */}
		{[...numbers.map((activated, num) => <Block key={num} num={num} activated={activated} flip={() => flipNumber(num)} active={active} />)]}

	</Svg>
}


function Block({ num, activated, flip, active }) {
	const theme = useTheme()

	// Set up handlers.
	const [hover, setHover] = useState(false)

	// Set up listeners for various events.
	const ref = useRefWithEventListeners({
		mouseenter: () => setHover(true),
		mouseleave: () => setHover(false),
		click: () => flip(),
	})

	// Determine the coordinates where the number should be positioned.
	const col = num % width
	const row = (num - col) / width
	const x = margin + (size + gap) * col + size / 2
	const y = margin + (size + gap) * row + size / 2

	// Render the block.
	let fill = activated ? theme.palette.success.main : theme.palette.primary.main
	if (hover)
		fill = lighten(fill, 0.2)
	return <g ref={ref} transform={`translate(${x}, ${y})`} style={{ cursor: active ? 'pointer' : 'default' }}>
		<rect key={num} x={-size / 2} y={-size / 2} width={size} height={size} rx={radius} ry={radius} fill={fill} />
		<text x={0} y={0} fill="#eee" style={{ fontSize: '16px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle' }} transform="translate(0, 2)">{num + 1}</text>
	</g>
}

function getNumPrimeFactors(num) {
	return getFactorization(num).reduce((sum, value) => sum + value, 0)
}

import { useState, useRef, useEffect } from 'react'
import { useTheme, darken, lighten, styled } from '@mui/material/styles'

import { getFactorization, useRefWithEventListeners } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'

// Set up settings for the Interface.
const size = 80
const margin = 20
const gap = 12
const radius = 10
const width = 360
const height = 4 * size + 2 * margin + 3 * gap

export function Interface({ submitAction, isCurrentAction }) {
	const active = isCurrentAction
	const theme = useTheme()
	const svgRef = useRef()
	const [numbers, setNumbers] = useRiddleStorage('musicDoor', getInitialNumbers())

	// Set up handlers to adjust the state.
	const adjustNumber = (index, toRight) => {
		if (!active)
			return
		setNumbers(numbers => {
			numbers = [...numbers]
			numbers[index] = (numbers[index] + (toRight ? 1 : 9)) % 10
			return numbers
		})
	}
	
	// Check the value of the input.
	const allCorrect = areNumbersCorrect(numbers)
	useEffect(() => {
		if (allCorrect && isCurrentAction)
			submitAction({ type: 'unlockDoor', to: 'CS' })
	}, [allCorrect, isCurrentAction, submitAction])

	// Render the interface.
	return <Svg ref={svgRef} size={[width, height]} style={{ borderRadius: '1rem', overflow: 'visible', maxWidth: width }}>
		{numbers.map((number, index) => <Dial key={index} number={number} index={index} adjust={(toRight) => adjustNumber(index, toRight)} active={active} />)}
	</Svg>
}

function Dial({ index, number, adjust, active }) {
	const theme = useTheme()

	// Set up listeners for various events.
	const ref = useRefWithEventListeners(active ? {
		// mouseenter: () => setHover(true),
		// mouseleave: () => setHover(false),
		// click: () => flip(),
	} : {})

	// Render the block.
	const coords = getPosition(index)
	// if (active && hover)
	// 	fill = lighten(fill, 0.2)
	//  style={{ cursor: active ? 'pointer' : 'default' }}
	const f = Math.sqrt(2) / 2

	return <g ref={ref} transform={`translate(${coords.x}, ${coords.y})`}>
		<rect key={index} x={-size / 2} y={-size / 2} width={size} height={size} rx={radius} ry={radius} fill={theme.palette.primary.main} />
		<text x={0} y={0} fill="#eee" style={{ fontSize: '32px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle' }} transform="translate(0, 2)">{number}</text>

		<StyledPath d={`M${-size * 1.3} 0 v${size / 2 - radius} a${radius} ${radius} 0 0 1 ${-radius * (1 + f)} ${radius * f} l${-size / 2 + radius} ${-size / 2 + radius} a${radius} ${radius} 0 0 1 0 ${-2 * radius * f} l${size / 2 - radius} ${-size / 2 + radius} a${radius} ${radius} 0 0 1 ${radius * (1 + f)} ${radius * f} v${size / 2 - radius}`} style={{ cursor: active ? 'pointer' : 'default' }} onClick={() => adjust(false)} />
		<StyledPath d={`M${size * 1.3} 0 v${size / 2 - radius} a${radius} ${radius} 0 0 0 ${radius * (1 + f)} ${radius * f} l${size / 2 - radius} ${-size / 2 + radius} a${radius} ${radius} 0 0 0 0 ${-2 * radius * f} l${-size / 2 + radius} ${-size / 2 + radius} a${radius} ${radius} 0 0 0 ${-radius * (1 + f)} ${radius * f} v${size / 2 - radius}`} style={{ cursor: active ? 'pointer' : 'default' }} onClick={() => adjust(true)} />
	</g>
}

const StyledPath = styled('path')(({ theme }) => ({
	fill: theme.palette.primary.main,
	'&:hover': {
		fill: lighten(theme.palette.primary.main, 0.2),
	},
}))

// Define positioning functions.
function getPosition(index) {
	return { x: width / 2, y: index * (size + gap) + margin + size / 2 }
}

// Define grading functions.
const correctNumbers = [2, 0, 4, 5].map(x => x + 2)
function areNumbersCorrect(numbers) {
	return correctNumbers.every((number, index) => number === numbers[index])
}
function getInitialNumbers() {
	const numbers = correctNumbers.map(() => Math.floor(Math.random() * 10))
	if (numbers.every((number, index) => number !== correctNumbers[index]))
		return numbers
	return getInitialNumbers()
}

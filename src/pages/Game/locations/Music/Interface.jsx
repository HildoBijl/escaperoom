import { useRef, useEffect } from 'react'
import { useTheme, lighten, styled } from '@mui/material/styles'

import { mod, useTransitionedValue } from 'util'

import { useRiddleStorage } from '../../util'
import { Svg } from '../../components'

// Set up settings for the Interface.
const size = 60 // Size of a dial square.
const margin = 20 // Around the lock.
const gap = 12 // Between dials.
const radius = 10 // Border radius.
const dialGap = 2 // Between numbers on the dial.
const wheelDigitSize = 10 // Adjust the number of digits the wheel seems to have.
const buttonGap = 16 // Between dial and arrow buttons.
const verticalFactor = 0.15 // How much should the digits move vertically?
const displayBoundary = wheelDigitSize / 4
const dialRadius = (wheelDigitSize * (size + dialGap)) / (2 * Math.PI)
const verticalRadius = dialRadius * verticalFactor
const buttonsShift = verticalRadius * 0.1 // How much should the buttons shift along with the vertical shift of the dial?
const height = 4 * size + 2 * margin + 3 * gap + verticalRadius
const width = 2 * dialRadius + 2 * buttonGap + 2 * size / Math.sqrt(2) + 2 * margin

export function Interface({ submitAction, isCurrentAction }) {
	const active = isCurrentAction
	const svgRef = useRef()
	const [numbers, setNumbers] = useRiddleStorage('musicDoor', getInitialNumbers())

	// Set up handlers to adjust the state.
	const adjustNumber = (index, toRight) => {
		if (!active)
			return
		setNumbers(numbers => {
			numbers = [...numbers]
			numbers[index] = numbers[index] + (toRight ? -1 : 1)
			return numbers
		})
	}

	// Check the value of the input.
	const allCorrect = areNumbersCorrect(numbers)
	useEffect(() => {
		if (allCorrect && isCurrentAction)
			submitAction({ type: 'unlockDoor', to: 'Art' })
	}, [allCorrect, isCurrentAction, submitAction])

	// Render the interface.
	return <Svg ref={svgRef} size={[width, height]} style={{ borderRadius: '1rem', overflow: 'visible', maxWidth: width }}>
		{numbers.map((number, index) => <Dial key={index} number={number} index={index} adjust={(toRight) => adjustNumber(index, toRight)} active={active} />)}
	</Svg>
}

const digits = (new Array(10)).fill(0).map((_, index) => index)
function Dial({ index, number, adjust, active }) {
	const theme = useTheme()
	const numberEased = useTransitionedValue(number, theme.transitions.duration.standard)

	// Render the block.
	const coords = getPosition(index)
	const f = Math.sqrt(2) / 2
	return <g transform={`translate(${coords.x}, ${coords.y})`}>
		{/* All digits */}
		{digits.map(digit => {
			const distance = (digit - numberEased)
			const cyclicDistance = mod(distance + 5, 10) - 5
			const ratio = cyclicDistance / displayBoundary
			const angle = ratio * Math.PI / 2
			const visible = Math.abs(cyclicDistance) < displayBoundary
			const shiftX = (visible ? Math.sin(angle) : Math.sign(cyclicDistance)) * dialRadius
			const shiftY = (visible ? Math.cos(angle) : Math.sign(cyclicDistance)) * verticalRadius
			const scale = (visible ? Math.cos(angle) : 0)
			const skew = -(visible ? Math.sin(angle) : Math.sign(cyclicDistance)) * 60 * verticalFactor

			return <g key={digit} transform={`translate(${shiftX}, ${shiftY}) scale(${scale}, 1) skewY(${skew})`} style={{ opacity: visible ? (1 - 0.9 * Math.abs(Math.sin(angle))) : 0 }}>
				<rect x={-size / 2} y={-size / 2} width={size} height={size} rx={radius} ry={radius} fill={theme.palette.primary.main} />
				<text x={0} y={0} fill="#eee" style={{ fontSize: '32px', fontWeight: 500, textAnchor: 'middle', dominantBaseline: 'middle' }} transform="translate(0, 2)">{digit}</text>
			</g>
		})}

		{/* Buttons */}
		<StyledPath active={active} d={`M${-dialRadius - buttonGap} ${buttonsShift} v${size / 2 - radius} a${radius} ${radius} 0 0 1 ${-radius * (1 + f)} ${radius * f} l${-size / 2 + radius} ${-size / 2 + radius} a${radius} ${radius} 0 0 1 0 ${-2 * radius * f} l${size / 2 - radius} ${-size / 2 + radius} a${radius} ${radius} 0 0 1 ${radius * (1 + f)} ${radius * f} v${size / 2 - radius}`} style={{ cursor: active ? 'pointer' : 'default' }} onClick={() => adjust(false)} />
		<StyledPath active={active} d={`M${dialRadius + buttonGap} ${buttonsShift} v${size / 2 - radius} a${radius} ${radius} 0 0 0 ${radius * (1 + f)} ${radius * f} l${size / 2 - radius} ${-size / 2 + radius} a${radius} ${radius} 0 0 0 0 ${-2 * radius * f} l${-size / 2 + radius} ${-size / 2 + radius} a${radius} ${radius} 0 0 0 ${-radius * (1 + f)} ${radius * f} v${size / 2 - radius}`} style={{ cursor: active ? 'pointer' : 'default' }} onClick={() => adjust(true)} />
	</g>
}

const StyledPath = styled('path')(({ theme, active }) => ({
	fill: theme.palette.primary.main,
	userSelect: 'none',
	WebkitTapHighlightColor: 'transparent',
	'&:hover': {
		fill: active ? lighten(theme.palette.primary.main, 0.2) : undefined,
	},
}))

// Define positioning functions.
function getPosition(index) {
	return { x: width / 2, y: index * (size + gap) + margin + size / 2 }
}

// Define grading functions.
const correctNumbers = [2, 0, 4, 5].map(x => x + 2)
function areNumbersCorrect(numbers) {
	return correctNumbers.every((number, index) => number === mod(numbers[index], 10))
}
function getInitialNumbers() {
	const numbers = correctNumbers.map(() => Math.floor(Math.random() * 10))
	if (numbers.every((number, index) => number !== correctNumbers[index]))
		return numbers
	return getInitialNumbers()
}

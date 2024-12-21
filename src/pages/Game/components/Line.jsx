import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import { ArrowDropDown as ArrowIcon } from '@mui/icons-material'

export function Line({ text, children }) {
	// Use collapsing.
	const [open, setOpen] = useState(true)

	// Load in styling data.
	const theme = useTheme()
	const color = theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.secondary.main
	const lineStyle = { flexGrow: 1, background: color, height: '1px', minWidth: '30px', transform: 'translateY(1px)' }
	const arrowStyle = { flexGrow: 0, color, transform: 'translateY(3pt)' }

	// Render the line.
	return <>
		<Box sx={{ cursor: 'pointer', display: 'flex', flexFlow: 'row nowrap', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => setOpen(open => !open)}>
			<Box sx={arrowStyle}><ArrowIcon sx={{ transition: `transform ${theme.transitions.duration.standard}ms`, transform: `scale(1.3) rotate(${open ? 0 : -90}deg)` }} /></Box>
			<Box sx={lineStyle} />
			<Box sx={{ flexGrow: 0, color, fontWeight: 500, padding: '2px 6px', textAlign: 'center' }}>{text}</Box>
			<Box sx={lineStyle} />
			<Box sx={arrowStyle}><ArrowIcon sx={{ transition: `transform ${theme.transitions.duration.standard}ms`, transform: `scale(1.3) rotate(${open ? 0 : 90}deg)` }} /></Box>
		</Box>
		<Collapse orientation="vertical" in={open}>
			<Box sx={{ mt: -1.2 }}>
				{children}
			</Box>
		</Collapse>
	</>
}

import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'

export function Line({ text }) {
	// Load in styling data.
	const theme = useTheme()
	const color = theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.secondary.main
	const lineStyle = { flexGrow: 1, background: color, height: '1px', transform: 'translateY(2px)' }

	// Render the line.
	return <Box sx={{ display: 'flex', flexFlow: 'row nowrap', alignItems: 'center', justifyContent: 'space-between' }}>
		<Box sx={lineStyle} />
		<Box sx={{ flexGrow: 0, color, fontWeight: 500, padding: '2px 6px' }}>{text}</Box>
		<Box sx={lineStyle} />
	</Box>
}

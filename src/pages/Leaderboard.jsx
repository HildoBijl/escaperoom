import { useMemo, Fragment } from 'react'
import { useTheme, lighten } from '@mui/material/styles'
import Box from '@mui/material/Box'

import { useCollection } from 'fb'
import { Subpage } from 'components'

export function Leaderboard() {
	const leaderboard = useCollection('leaderboard', true)
	if (!leaderboard)
		return <Subpage /> // Empty page.
	return <LeaderboardWithData {...{ leaderboard }} />
}

function LeaderboardWithData({ leaderboard }) {
	// Define styling.
	const theme = useTheme()
	const headStyle = { background: theme.palette.primary.main, color: theme.palette.primary.contrastText, padding: '4px 8px 6px', borderRadius: '8px' }
	const fieldStyle = { ...headStyle, background: lighten(theme.palette.primary.main, 0.9), color: '#000', ':nth-of-type(8n+1), :nth-of-type(8n+2), :nth-of-type(8n+3), :nth-of-type(8n+4)': { background: lighten(theme.palette.primary.main, 0.82) } }

	// Process data.
	const list = useMemo(() => {
		return Object.values(leaderboard).sort((a, b) => b.date - a.date) // Sort descending, to show newest at the top.
	}, [leaderboard])

	return <Subpage>
		<p>Als je de Escape Room oplost, dan kun je je naam toevoegen aan de onderstaande lijst. Je hoeft hiervoor niet per se aan de actievoorwaarden voor de prijsvraag te voldoen.</p>
		<Box sx={{ my: 2, display: 'grid', gridTemplateColumns: '3fr 3fr 1fr 2fr', gap: '3px' }}>
			<Box sx={{ ...headStyle }}><strong>Naam</strong></Box>
			<Box sx={{ ...headStyle }}><strong>Plaats</strong></Box>
			<Box sx={{ ...headStyle, textAlign: 'center' }}><strong>Leeftijd</strong></Box>
			<Box sx={{ ...headStyle, textAlign: 'center' }}><strong>Opgelost op</strong></Box>
			{list.map((solver, index) => {
				return <Fragment key={index}>
					<Box sx={{ ...fieldStyle }}>{solver.naam}</Box>
					<Box sx={{ ...fieldStyle }}>{solver.plaats}</Box>
					<Box sx={{ ...fieldStyle, textAlign: 'center' }}>{solver.leeftijd}</Box>
					<Box sx={{ ...fieldStyle, textAlign: 'center' }}>{solver.date.toDate().toLocaleDateString('nl')}</Box>
				</Fragment>
			})}
		</Box>
	</Subpage>
}

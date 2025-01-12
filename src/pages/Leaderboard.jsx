import { useMemo, Fragment } from 'react'
import { useTheme, alpha } from '@mui/material/styles'
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
	const fade = alpha
	const sharedStyle = { background: theme.palette.primary.main, padding: '4px 8px 6px', borderRadius: '8px', display: 'flex', flexFlow: 'row nowrap', alignItems: 'center' }
	const headStyle = { ...sharedStyle, color: theme.palette.primary.contrastText }
	const fieldStyle = { ...sharedStyle, fontSize: '0.9em', fontWeight: 500, background: fade(theme.palette.primary.main, 0.18), ':nth-of-type(8n+1), :nth-of-type(8n+2), :nth-of-type(8n+3), :nth-of-type(8n+4)': { background: fade(theme.palette.primary.main, 0.3) } }

	// Process data.
	const list = useMemo(() => {
		return Object.values(leaderboard).sort((a, b) => b.date - a.date) // Sort descending, to show newest at the top.
	}, [leaderboard])

	return <Subpage>
		<p>Als je de Escape Room oplost, dan kun je je naam toevoegen aan de onderstaande lijst. Je hoeft hiervoor niet per se aan de actievoorwaarden voor de prijsvraag te voldoen.</p>
		<Box sx={{ my: 2, display: 'grid', gridTemplateColumns: '3fr 3fr 1fr 2fr', gap: '3px' }}>
			<Box sx={{ ...headStyle }}><strong>Naam</strong></Box>
			<Box sx={{ ...headStyle }}><strong>Plaats</strong></Box>
			<Box sx={{ ...headStyle, justifyContent: 'center' }}><strong>Leeftijd</strong></Box>
			<Box sx={{ ...headStyle, justifyContent: 'center' }}><strong>Opgelost</strong></Box>
			{list.map((solver, index) => {
				return <Fragment key={index}>
					<Box sx={{ ...fieldStyle }}>{solver.naam}</Box>
					<Box sx={{ ...fieldStyle }}>{solver.plaats}</Box>
					<Box sx={{ ...fieldStyle, justifyContent: 'center' }}>{solver.leeftijd}</Box>
					<Box sx={{ ...fieldStyle, justifyContent: 'center' }}>{solver.date.toDate().toLocaleDateString('nl', { month: "short", day: "numeric" })}</Box>
				</Fragment>
			})}
		</Box>
	</Subpage>
}

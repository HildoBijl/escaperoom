import ReplayIcon from '@mui/icons-material/Replay'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'

import { useLocalStorageState } from 'util'
import { Subpage } from 'components'

import * as locations from './locations'

export function Game() {
	const [history, setHistory, clearHistory] = useLocalStorageState([{ state: { location: 'Office' } }])
	console.log(setHistory, clearHistory)

	return <Subpage>
		<ResetButton {...{ clearHistory }} />
		{history.map((item, index) => {
			// Gather data about the location that we're in.
			const { state, action } = item
			const previousState = history[index - 1]?.state
			const numVisits = history.reduce((counter, runItem, runIndex) => counter + (runIndex <= index && runItem?.state?.location === item?.state?.location ? 1 : 0), 0)

			// Render the location.
			const Location = locations[state.location]
			const locationRender = <Location key={index} {...{ state, previousState, numVisits, action }} />

			// Depending on the story, add other components like a line or a question.
			if (index === history.length - 1)
				return locationRender
			return <>
				{locationRender}
				<hr />
			</>
		})}
	</Subpage>
}

function ResetButton({ clearHistory }) {
	// Define a handler to reset the game history.
	const confirmReset = () => {
		if (window.confirm('Weet je zeker dat je het spel wilt resetten? Je begint dan weer vanaf het begin.'))
			clearHistory()
	}

	// Render the reset button.
	return <div style={{ position: 'absolute', top: '0px', right: '12px' }}>
		<Tooltip title="Spel opnieuw beginnen" arrow>
			<Fab color="primary" size="medium" onClick={confirmReset} sx={{ outline: 'none' }}>
				<ReplayIcon />
			</Fab>
		</Tooltip>
	</div>

}

import ReplayIcon from '@mui/icons-material/Replay'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'

import { clearRiddleStorage } from '../util'

export function ResetButton({ clearHistory }) {
	// Define a handler to reset the game history.
	const confirmReset = () => {
		if (window.confirm('Weet je zeker dat je het spel wilt resetten? Je begint dan weer vanaf het begin.')) {
			clearRiddleStorage()
			clearHistory()
		}
	}

	// Render the reset button.
	return <div style={{ float: 'right', margin: '5px 2px 4px 16px' }}>
		<Tooltip title="Spel opnieuw beginnen" arrow>
			<Fab color="primary" size="medium" onClick={confirmReset} sx={{ outline: 'none' }}>
				<ReplayIcon />
			</Fab>
		</Tooltip>
	</div>
}

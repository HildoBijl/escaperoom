import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

// ChoiceButtons renders the buttons which the user can choose from, given a list of options.
export function ChoiceButtons({ options, submitAction }) {
	// Process the options array.
	if (!Array.isArray(options))
		options = [options]
	options = options.filter(option => !!option)

	// On empty options, render nothing.
	if (options.length === 0)
		return null

	// Render the buttons.
	return <Box sx={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'space-between', alignItems: 'stretch', gap: '0.6rem', mt: 1.5, mb: 3 }}>
		{options.map(({ text, action }) => <ChoiceButton key={text} text={text} onClick={() => submitAction(action)} />)}
	</Box>
}

// ChoiceButton is a single button that can be chosen.
function ChoiceButton({ text, onClick }) {
	return <Button variant="contained" onClick={onClick} sx={{ flexGrow: 1, height: '3rem' }}>
		{text}
	</Button>
}

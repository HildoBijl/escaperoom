import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

// ChoiceButtons renders the buttons which the user can choose from, given a list of options.
export function ChoiceButtons({ options, submitAction }) {
	// Process the options array.
	if (!Array.isArray(options))
		options = [options]
	options = options.filter(option => !!option)

	// Render the buttons.
	return <Box style={{ display: 'flex', flexFlow: 'row wrap', justifyContent: 'space-between', alignItems: 'stretch', gap: '0.6rem' }}>
		{options.map(({ text, action }, optionIndex) => <ChoiceButton key={optionIndex} text={text} onClick={() => submitAction(action)} />)}
	</Box>
}

// ChoiceButton is a single button that can be chosen.
function ChoiceButton({ text, onClick }) {
	return <Button variant="contained" onClick={onClick} sx={{ flexGrow: 1, height: '3rem' }}>
		{text}
	</Button>
}

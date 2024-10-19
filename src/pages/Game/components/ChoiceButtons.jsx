import { useTheme, darken } from '@mui/material/styles'
import Box from '@mui/material/Box'

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
	const theme = useTheme()
	return <Box
		onClick={onClick}
		sx={{
			// Coloring.
			background: theme.palette.primary.main,
			borderStyle: 'solid',
			borderWidth: '0.25rem',
			borderColor: darken(theme.palette.primary.main, 0.2),
			color: theme.palette.primary.contrastText,

			'&:hover': {
				background: darken(theme.palette.primary.main, 0.2),
				borderColor: darken(theme.palette.primary.main, 0.4),
			},

			// Sizing.
			borderRadius: '1rem',
			flexGrow: 1,
			fontWeight: 500,
			height: '3.5rem',
			minWidth: '12rem',

			// Contents.
			display: 'flex',
			flexFlow: 'row nowrap',
			justifyContent: 'center',
			alignItems: 'center',
			textAlign: 'center',
			cursor: 'pointer',
		}}>
		{text}
	</Box>
}

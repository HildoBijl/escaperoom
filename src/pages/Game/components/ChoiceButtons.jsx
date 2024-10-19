import { updateHistory } from '../engine'

// ChoiceButtons renders the buttons which the user can choose from, given a list of options.
export function ChoiceButtons({ options, setHistory }) {
	return <div>
		{options.map((option, optionIndex) => {
			const { text, action } = option
			const processChoice = () => setHistory(history => updateHistory(history, action))
			return <div key={optionIndex} onClick={processChoice}>{text}</div>
		})}
	</div>
}

import { useCallback, useEffect } from 'react'
import Alert from '@mui/material/Alert'

import { lastOf, useLocalStorageState } from 'util'
import { Subpage } from 'components'

import { isAdmin, isTester } from './util'
import * as locations from './locations'
import { initialHistory, localStorageKey, updateHistory, getState, getNumVisits, getNumActionVisits, getPreviousAction, getNextAction } from './engine'

export function Game() {
	const [history, setHistory, clearHistory] = useLocalStorageState(localStorageKey, initialHistory)
	const submitAction = useCallback((action) => setHistory(history => updateHistory(history, action)), [setHistory])

	// Gather all data and functions in one place.
	const finalState = getState(history)
	const data = { history, setHistory, clearHistory, submitAction, finalState }

	// Render the Game.
	return <Subpage>
		{isAdmin() ? <Alert severity="warning" sx={{ my: 2 }}>Adminrechten zijn actief. De gehele Escape Room is beschikbaar, en je kunt puzzels overslaan indien gewenst.</Alert> : null}
		{isTester() ? <Alert severity="warning" sx={{ my: 2 }}>Tester modus is actief. De gehele Escape Room is beschikbaar, voor zover hij al gebouwd is. Bedankt voor het testen!</Alert> : null}
		{history.map((item, locationIndex) => {
			// Gather data about the location that we're in.
			const { location, actions } = item
			const isCurrentLocation = locationIndex === history.length - 1
			const state = getState(history, locationIndex)
			return <Location key={locationIndex} {...{ ...data, location, locationIndex, isCurrentLocation, actions, state }} />
		})}
		{getState(history).allDone ? <EndingScreen /> : null}
	</Subpage>
}

function Location(props) {
	const { history, location, actions, locationIndex, isCurrentLocation } = props
	const locationComponents = locations[location]

	// Calculate relevant parameters.
	const numVisits = getNumVisits(history, location, locationIndex)

	// Render the location.
	const { Location, Action } = locationComponents
	return <>
		<Location {...{ ...props, numVisits }} />
		{actions.map((actionData, actionIndex) => {
			const isCurrentAction = isCurrentLocation && actionIndex === actions.length - 1
			const numActionVisits = getNumActionVisits(history, location, actionData.action, locationIndex, actionIndex)
			const previousAction = getPreviousAction(history, locationIndex, actionIndex)
			const nextAction = getNextAction(history, locationIndex, actionIndex)
			return <Action key={actionIndex} {...{ ...props, ...actionData, actionIndex, isCurrentAction, numActionVisits, previousAction, nextAction }} />
		})}
		{isCurrentLocation ? <ChoiceSelection {...props} /> : null}
	</>
}

function ChoiceSelection(props) {
	const { location, state: locationState, actions } = props
	const locationComponents = locations[location]

	// Determine the last action taken at this location.
	const lastActionData = lastOf(actions)
	const lastAction = lastActionData?.action
	const state = lastActionData?.state || locationState

	// On a change in action, scroll to the bottom of the page.
	useEffect(() => {
		document.documentElement.scrollTop = document.documentElement.scrollHeight
	}, [lastAction])

	// Render the Choice component of the location.
	const { Choice } = locationComponents
	return <Choice {...{ ...props, lastAction, state }} />
}

function EndingScreen() {
	return <>
		<Alert severity="info" sx={{ my: 2 }}>
			Gefeliciteerd! Je hebt de Escape Room opgelost! Je kunt nu één van twee dingen doen (of beiden).
			<ul style={{ marginTop: 6, marginBottom: 6 }}>
				<li>Voldoe je aan de criteria? Dan kun je je gegevens achterlaten om mee te doen voor de prijzen. Deze gegevens worden niet getoond: we gebruiken ze alleen voor de prijsuitreiking.</li>
				<li>Voor iedereen: je kunt je naam toevoegen aan het Leaderboard. Deze gegevens zijn voor iedereen zichtbaar, maar je bent niet verplicht je volledige naam in te vullen.</li>
			</ul>
		</Alert>
		<Alert severity="warning" sx={{ my: 2 }}>De formulieren voor de registratie van oplossers zijn helaas nog in ontwikkeling. Ze komen er uiterlijk 12 januari aan! Kom tegen die tijd terug om alsnog je gegevens achter te laten. Je hoeft de Escape Room niet opnieuw op te lossen (tenzij je hem reset).</Alert>
		<WinnerRegistration />
		<LeaderboardRegistration />
	</>
}

function WinnerRegistration() {
	return null
}

function LeaderboardRegistration() {
	return null
}

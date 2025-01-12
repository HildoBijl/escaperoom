import { useCallback, useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Accordion from '@mui/material/Accordion'
import AccordionActions from '@mui/material/AccordionActions'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Button from '@mui/material/Button'

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
		</Alert>

		<div style={{ marginBottom: '1.5rem' }}>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}><strong>Doe mee voor de prijzen</strong></AccordionSummary>
				<AccordionDetails>
					<WinnerRegistration />
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}><strong>Voeg je naam toe aan het leaderboard</strong></AccordionSummary>
				<AccordionDetails>
					<LeaderboardRegistration />
				</AccordionDetails>
			</Accordion>
		</div>
	</>
}

function WinnerRegistration() {
	return <>
		<p>Laat je gegevens hier achter om mee te doen voor de prijzen. Deze gegevens worden niet gepubliceerd, we gebruiken ze alleen voor de prijsuitreiking.</p>
	</>
}

function LeaderboardRegistration() {
	return <>
		<p>Iedereen die de Escape Room oplost mag de naam aan het Leaderboard toevoegen. Let op: de gegevens die je hier invoert zullen publiek zichtbaar zijn.</p>
		<Alert severity="warning">Het Leaderboard is nog in ontwikkeling. Deze komt er waarschijnlijk tegen 19 januari aan. Kom tegen die tijd terug om alsnog je gegevens achter te laten. Je hoeft de Escape Room niet opnieuw op te lossen (tenzij je hem reset).</Alert>
	</>
}

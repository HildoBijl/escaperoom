import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import { lastOf, useLocalStorageState } from 'util'
import { addDocument } from 'fb'
import { Subpage } from 'components'

import { isAdmin, isTester, useRiddleStorage } from './util'
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
			Gefeliciteerd! Je hebt de Escape Room opgelost! Je kunt nu je naam toevoegen aan de <Link to="/leaderboard">lijst van oplossers</Link>. Let op: de gegevens die je hier invoert zullen publiek zichtbaar zijn.
		</Alert>

		<LeaderboardRegistration />
	</>
}

function FormPart({ children }) {
	return <Box sx={{ my: 2 }}>{children}</Box>
}

function LeaderboardRegistration() {
	const [submitted, setSubmitted] = useRiddleStorage('leaderboardSubmitted', false)
	const [data, setData] = useState({ naam: '', plaats: '', leeftijd: '' })
	const setParam = (key, value) => setData(data => ({ ...data, [key]: value }))

	// Set up checks for the input.
	const checks = {
		naam: 'Voornaam',
		plaats: 'Plaats',
		leeftijd: 'Leeftijd',
	}
	const missingFields = Object.keys(checks).filter(key => !data[key])
	const missingFieldsLabels = missingFields.map(key => checks[key])
	const missingFieldsString = missingFields.length === 1 ? missingFieldsLabels[0] : missingFieldsLabels.slice(0, -1).join(', ') + ' en ' + missingFieldsLabels[missingFields.length - 1]
	const checksPassed = missingFields.length === 0

	// Define a handler to submit the data.
	const submitData = () => {
		if (!checksPassed)
			return
		addDocument('leaderboard', { ...data, date: new Date() })
		setSubmitted(true)
	}

	// On a submission, show a success message.
	if (submitted)
		return <Alert severity="success">Je bent toegevoegd aan de <Link to="/leaderboard">lijst van oplossers</Link>!</Alert>

	// Show the form.
	const min = 5
	const max = 80
	return <>
		<p style={{ marginTop: '-8px', marginBottom: '12px' }}>
			Iedereen die de Escape Room oplost mag de naam aan de <Link to="/leaderboard">lijst van oplossers</Link> toevoegen. Let op: de gegevens die je hier invoert zullen publiek zichtbaar zijn.
		</p>
		<FormPart>
			<TextField fullWidth variant="outlined" id="naam" label="Voornaam" value={data.naam} onChange={event => setParam('naam', event.target.value)} />
		</FormPart>
		<FormPart>
			<TextField fullWidth variant="outlined" id="plaats" label="Plaats (stad/gemeente)" value={data.plaats} onChange={event => setParam('plaats', event.target.value)} />
		</FormPart>
		<FormPart>
			<FormControl fullWidth>
				<InputLabel id="labelLeeftijd">Leeftijd</InputLabel>
				<Select labelId="labelLeeftijd" id="leeftijd" value={data.leeftijd} label="Leeftijd" onChange={event => setParam('leeftijd', event.target.value)}>
					<MenuItem value={min}>{min} (en onder)</MenuItem>
					{new Array(max - min - 1).fill(0).map((_, index) => <MenuItem key={index + min + 1} value={index + min + 1}>{index + min + 1}</MenuItem>)}
					<MenuItem value={max}>{max} (en boven)</MenuItem>
				</Select>
			</FormControl>
		</FormPart>
		{checksPassed ? null : <Alert severity="warning" sx={{ my: 2 }}>Je hebt nog niet alles ingevuld. {missingFields.length === 1 ? <>Het veld {missingFieldsString} is nog leeg.</> : <>De velden {missingFieldsString} zijn nog leeg.</>}</Alert>}
		<Button variant="contained" disabled={!checksPassed} onClick={submitData}>Gegevens insturen</Button>
	</>
}

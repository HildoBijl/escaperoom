import { useState, useCallback, useEffect } from 'react'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

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

function FormPart({ children }) {
	return <Box sx={{ my: 2 }}>{children}</Box>
}

function WinnerRegistration() {
	const [data, setData] = useState({ klas123: 'unknown', nooitBijVierkant: 'unknown' })
	const setParam = (key, value) => setData(data => ({ ...data, [key]: value }))

	const failsCriteria = <Alert severity="warning" sx={{ my: 1 }}>
		Helaas, je voldoet niet aan de criteria om mee te doen voor de prijzen. Je kunt eventueel wel je naam toevoegen aan het leaderboard.
	</Alert>

	return <>
		<p style={{ marginTop: '-8px', marginBottom: '12px' }}>
			Als eerste kijken we of je aan de criteria voldoet om mee te mogen doen.
		</p>
		<FormControl sx={{ my: 1 }}>
			<FormLabel id="klas123">Zit jij op dit moment (studiejaar 2024-2025) in klas 1, 2 of 3 van de middelbare school?</FormLabel>
			<RadioGroup name="klas123" value={data.klas123} onChange={(event) => setParam('klas123', event.target.value)}>
				<FormControlLabel value="yes" control={<Radio />} label="Ja, ik zit in klas 1, 2 of 3 van de middelbare school." />
				<FormControlLabel value="no" control={<Radio />} label="Nee, ik zit niet in klas 1, 2 of 3 van de middelbare school." />
			</RadioGroup>
		</FormControl>
		{data.klas123 === 'no' ? failsCriteria : null}
		{data.klas123 === 'yes' ? <>
			<FormControl sx={{ my: 1 }}>
				<FormLabel id="nooitBijVierkant">Ben je al eens eerder meegeweest op een zomerkamp van de stichting Vierkant voor Wiskunde?</FormLabel>
				<RadioGroup name="nooitBijVierkant" value={data.nooitBijVierkant} onChange={(event) => setParam('nooitBijVierkant', event.target.value)}>
					<FormControlLabel value="yes" control={<Radio />} label="Ja, ik ben al eens met een Vierkant zomerkamp meegeweest." />
					<FormControlLabel value="no" control={<Radio />} label="Nee, ik ben nog nooit meegeweest met een Vierkant zomerkamp." />
				</RadioGroup>
			</FormControl>
			{data.nooitBijVierkant === 'yes' ? failsCriteria : null}
			{data.nooitBijVierkant === 'no' ? <>
				<p style={{ marginBottom: '1.5rem' }}>Je voldoet aan de criteria! Laat je gegevens achter om meegenomen te worden in de loting voor de prijzen. Deze gegevens worden niet gepubliceerd: ze zijn alleen voor de prijsuitreiking.</p>
				<FormPart>
					<TextField fullWidth variant="outlined" id="voornaam" label="Voornaam" value={data.voornaam} onChange={event => setParam('voornaam', event.target.value)} />
				</FormPart>
				<FormPart>
					<TextField fullWidth variant="outlined" id="achternaam" label="Achternaam" value={data.achternaam} onChange={event => setParam('achternaam', event.target.value)} />
				</FormPart>
				<FormPart>
					<FormControl fullWidth>
						<InputLabel id="labelGeslacht">Geslacht</InputLabel>
						<Select labelId="labelGeslacht" id="geslacht" value={data.geslacht || ''} label="Geslacht" onChange={event => setParam('geslacht', event.target.value)}						>
							<MenuItem value="vrouw">Vrouw</MenuItem>
							<MenuItem value="man">Man</MenuItem>
							<MenuItem value="anders">Anders</MenuItem>
						</Select>
					</FormControl>
				</FormPart>
			</> : null}
		</> : null}
	</>
}

function LeaderboardRegistration() {
	return <>
		<p>Iedereen die de Escape Room oplost mag de naam aan het Leaderboard toevoegen. Let op: de gegevens die je hier invoert zullen publiek zichtbaar zijn.</p>
		<Alert severity="warning">Het Leaderboard is nog in ontwikkeling. Deze komt er waarschijnlijk tegen 19 januari aan. Kom tegen die tijd terug om alsnog je gegevens achter te laten. Je hoeft de Escape Room niet opnieuw op te lossen (tenzij je hem reset).</Alert>
	</>
}

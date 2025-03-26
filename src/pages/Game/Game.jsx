import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

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
			Gefeliciteerd! Je hebt de Escape Room opgelost! Je kunt nu één of meerdere van de volgende dingen doen.
		</Alert>

		<div style={{ marginBottom: '1.5rem' }}>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}><strong>Doe mee voor de hoofdprijs: één van de twintig gratis plekken op een zomerkamp</strong></AccordionSummary>
				<AccordionDetails>
					<WinnerRegistration />
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}><strong>Claim de extra prijs: tickets voor wiskundefestival Mathfest</strong></AccordionSummary>
				<AccordionDetails>
					<p>Iedereen die de Escape Room oplost (jij dus ook) kan een individueel kaartje claimen voor het <a href="https://platformwiskunde.nl/mathfest/" target="_blank">wiskundefestival Mathfest</a> op zondag 11 mei in Utrecht! Dat kaartje is inclusief drankjes, versnaperingen gedurende de middag, en avondeten van de foodtrucks in de avond. Er zijn in totaal ook 25 familiekaartjes beschikbaar. Die gelden voor 3-4 mensen, eveneens inclusief drankjes, versnaperingen gedurende de middag, en avondeten van de foodtrucks in de avond.</p>
					<p>Wil je (alleen of als familie) naar Mathfest? Stuur dan een mailtje naar <a href="mailto:pr@platformwiskunde.nl">pr@platformwiskunde.nl</a>, vermeld codewoord <strong>ontsnapt</strong>, en claim je gewonnen ticket(s). (Zolang de voorraad strekt.)</p>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}><strong>Voeg je naam toe aan de lijst van oplossers</strong></AccordionSummary>
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
	const [submitted, setSubmitted] = useRiddleStorage('dataSubmitted', false)
	const [data, setData] = useState({ klas123: '', ooitMeeBijVierkant: '', voornaam: '', achternaam: '', geslacht: '', geboortedatum: null, straatEnHuisnummer: '', postcode: '', plaats: '', schoolNaam: '', klas: '', email: '', telefoon: '', voorkeur: '', opmerkingen: '' })
	const setParam = (key, value) => setData(data => ({ ...data, [key]: value }))

	// Set up checks for the input.
	const checks = {
		voornaam: 'Voornaam',
		achternaam: 'Achternaam',
		geslacht: 'Geslacht',
		geboortedatum: 'Geboortedatum',
		straatEnHuisnummer: 'Straat en huisnummer',
		postcode: 'Postcode',
		plaats: 'Plaats',
		schoolNaam: 'Naam school',
		klas: 'Klas',
		email: 'Emailadres',
		telefoon: 'Telefoonnummer',
		voorkeur: 'Voorkeur voor kamp',
	}
	const missingFields = Object.keys(checks).filter(key => !data[key])
	const missingFieldsLabels = missingFields.map(key => checks[key])
	const missingFieldsString = missingFields.length === 1 ? missingFieldsLabels[0] : missingFieldsLabels.slice(0, -1).join(', ') + ' en ' + missingFieldsLabels[missingFields.length - 1]
	const checksPassed = missingFields.length === 0

	// Define a message to show when the criteria aren't met.
	const failsCriteria = <Alert severity="warning" sx={{ my: 1 }}>
		Helaas, je voldoet niet aan de criteria om mee te doen voor de prijzen. Je kunt eventueel wel je naam toevoegen aan de <Link to="/leaderboard">lijst van oplossers</Link>.
	</Alert>

	// Define a handler to submit the data.
	const submitData = () => {
		if (!checksPassed)
			return
		addDocument('winners', { ...data, geboortedatum: data.geboortedatum.format('DD-MM-YYYY'), ingezonden: new Date() })
		setSubmitted(true)
	}

	// If the deadline has passed, note this.
	if (new Date() > new Date('2025-06-15 00:00:00'))
		return <Alert severity="warning">De deadline voor het meedoen voor de prijsuitreiking is voorbij. Je kunt helaas niet meer meedoen.</Alert>

	// On a submission, show a success message.
	if (submitted)
		return <Alert severity="success">Je gegevens zijn succesvol ingezonden! In juni zal de loting plaatsvinden.</Alert>

	// Show the form.
	return <>
		<p style={{ marginTop: '-8px', marginBottom: '12px' }}>
			Als eerste kijken we of je aan de criteria voldoet om mee te mogen doen.
		</p>
		<FormControl sx={{ my: 1 }}>
			<FormLabel id="klas123">Zit jij op dit moment (studiejaar 2024-2025) in klas 1, 2 of 3 van de middelbare school?</FormLabel>
			<RadioGroup name="klas123" value={data.klas123} onChange={(event) => setParam('klas123', event.target.value)}>
				<FormControlLabel value="ja" control={<Radio />} label="Ja, ik zit in klas 1, 2 of 3 van de middelbare school." />
				<FormControlLabel value="nee" control={<Radio />} label="Nee, ik zit niet in klas 1, 2 of 3 van de middelbare school." />
			</RadioGroup>
		</FormControl>
		{data.klas123 === 'nee' ? failsCriteria : null}
		{data.klas123 === 'ja' ? <>
			<FormControl sx={{ my: 1 }}>
				<FormLabel id="ooitMeeBijVierkant">Ben je al eens eerder meegeweest op een zomerkamp van de stichting Vierkant voor Wiskunde?</FormLabel>
				<RadioGroup name="ooitMeeBijVierkant" value={data.ooitMeeBijVierkant} onChange={(event) => setParam('ooitMeeBijVierkant', event.target.value)}>
					<FormControlLabel value="ja" control={<Radio />} label="Ja, ik ben al eens met een Vierkant zomerkamp meegeweest." />
					<FormControlLabel value="nee" control={<Radio />} label="Nee, ik ben nog nooit meegeweest met een Vierkant zomerkamp." />
				</RadioGroup>
			</FormControl>
			{data.ooitMeeBijVierkant === 'ja' ? failsCriteria : null}
			{data.ooitMeeBijVierkant === 'nee' ? <>
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
						<Select labelId="labelGeslacht" id="geslacht" value={data.geslacht} label="Geslacht" onChange={event => setParam('geslacht', event.target.value)}>
							<MenuItem value="vrouw">Vrouw</MenuItem>
							<MenuItem value="man">Man</MenuItem>
							<MenuItem value="anders">Anders</MenuItem>
						</Select>
					</FormControl>
				</FormPart>
				<FormPart>
					<DatePicker fullWidth variant="outlined" id="geboortedatum" label="Geboortedatum" value={data.geboortedatum} onChange={value => setParam('geboortedatum', value)} slotProps={{ textField: { fullWidth: true } }} />
				</FormPart>
				<FormPart>
					<TextField fullWidth variant="outlined" id="straatEnHuisnummer" label="Straat en huisnummer" value={data.straatEnHuisnummer} onChange={event => setParam('straatEnHuisnummer', event.target.value)} />
				</FormPart>
				<FormPart>
					<TextField fullWidth variant="outlined" id="postcode" label="Postcode" value={data.postcode} onChange={event => setParam('postcode', event.target.value)} />
				</FormPart>
				<FormPart>
					<TextField fullWidth variant="outlined" id="plaats" label="Plaats (stad/gemeente)" value={data.plaats} onChange={event => setParam('plaats', event.target.value)} />
				</FormPart>
				<FormPart>
					<TextField fullWidth variant="outlined" id="schoolNaam" label="Naam school" value={data.schoolNaam} onChange={event => setParam('schoolNaam', event.target.value)} />
				</FormPart>
				<FormPart>
					<FormControl fullWidth>
						<InputLabel id="labelKlas">Klas</InputLabel>
						<Select labelId="labelKlas" id="klas" value={data.klas} label="Klas" onChange={event => setParam('klas', event.target.value)}>
							<MenuItem value="1">1</MenuItem>
							<MenuItem value="2">2</MenuItem>
							<MenuItem value="3">3</MenuItem>
							<MenuItem value="anders">Anders</MenuItem>
						</Select>
					</FormControl>
				</FormPart>
				<FormPart>
					<TextField fullWidth variant="outlined" id="email" label="Emailadres (om bij winst contact op te nemen)" value={data.email} onChange={event => setParam('email', event.target.value)} />
				</FormPart>
				<FormPart>
					<TextField fullWidth variant="outlined" id="telefoon" label="Telefoonnummer (als back-up)" value={data.telefoon} onChange={event => setParam('telefoon', event.target.value)} />
				</FormPart>
				<FormPart>
					<FormControl fullWidth>
						<InputLabel id="labelVoorkeur">Voorkeur voor kamp</InputLabel>
						<Select labelId="labelVoorkeur" id="voorkeur" value={data.voorkeur} label="Voorkeur voor kamp" onChange={event => setParam('voorkeur', event.target.value)}>
							<MenuItem value="Bx">Kamp Bx: 21 t/m 25 juli 2025</MenuItem>
							<MenuItem value="By">Kamp By: 11 t/m 15 augustus 2025</MenuItem>
							<MenuItem value="geen">Geen voorkeur/Nog onbekend</MenuItem>
						</Select>
					</FormControl>
				</FormPart>
				<FormPart>
					<TextField fullWidth multiline variant="outlined" id="opmerkingen" label="Opmerkingen (om in geval van winnen rekening mee te houden)" value={data.opmerkingen} onChange={event => setParam('opmerkingen', event.target.value)} />
				</FormPart>
				{checksPassed ? null : <Alert severity="warning" sx={{ my: 2 }}>Je hebt nog niet alles ingevuld. {missingFields.length === 1 ? <>Het veld {missingFieldsString} is nog leeg.</> : <>De velden {missingFieldsString} zijn nog leeg.</>}</Alert>}
				<Button variant="contained" disabled={!checksPassed} onClick={submitData}>Gegevens insturen</Button>
			</> : null}
		</> : null}
	</>
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

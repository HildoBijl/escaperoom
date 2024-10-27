import Alert from '@mui/material/Alert'

import { cases, isAdmin } from '../util'
import { ChoiceButtons, Line } from '../components'

export function Location({ numVisits }) {
	// If we're not in admin mode, then we're at the end of the teaser.
	if (!isAdmin()) {
		return <>
			<Alert severity="info" sx={{ my: 2 }}>
				<p style={{ marginTop: 0 }}>Gefeliciteerd! Je bent ontsnapt uit het kantoor! Maar dit was slechts de teaser...</p>
				<p style={{ marginBottom: 0 }}>De volledige Escape Room is nog in ontwikkeling en komt op <strong>6 januari 2025</strong> online. Vanaf dan kun je ook proberen om uit &quot;De Verlaten School&quot; te ontsnappen. Kom vooral terug!</p>
			</Alert>
		</>
	}

	// We're in the regular operation of the Escape Room.
	return cases(numVisits, [0, 3, 6, Infinity], [
		<p>Het lokaal ziet er exact hetzelfde uit als toen je klas er nog was, behalve dan dat iedereen weg is. Tegenover je is de deur naar de gang. Links is een tussendeur naar het aardrijkskundelokaal, en rechts kun je door naar natuurkunde.</p>,
		<p>Het wiskundelokaal is nog steeds hetzelfde als voorheen. Net zo verlaten als de rest van de school.</p>,
		<p>Het wiskundelokaal ziet er hetzelfde uit, maar het begint op je in te werken. De posters op de muur lijken dichterbij te komen.</p>,
		<p>Je denkt, &quot;niet weer het wiskundelokaal...&quot; Je blijft hier maar terugkomen. Is het de centrale spil in deze hele situatie?</p>,
	])
}

export function Action({ action }) {
	switch (action.type) {
		case 'move':
			switch (action.to) {
				case 'Office':
					return <Line text="Je stapt terug in het kantoor" />
				default:
					throw new Error(`Invalid move location: cannot determine what to render for an action of type "${action.type}" and to-parameter "${action.to}" at the current location.`)
			}
		default:
			throw new Error(`Invalid action type: cannot determine what to render for an action of type "${action.type}" at the current location.`)
	}
}

export function Choice(props) {
	return <ChoiceButtons {...props} options={getOptions(props)} />
}

function getOptions() {
	if (!isAdmin())
		return null
	return [{ text: 'Ga terug naar het kantoor', action: { type: 'move', to: 'Office' } }]
}

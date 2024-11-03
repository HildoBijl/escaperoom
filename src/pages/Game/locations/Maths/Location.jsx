import Alert from '@mui/material/Alert'

// import { Image } from 'components'
// import { OfficeOverview } from 'assets'

import { cases, isAdmin, isTester } from '../../util'

export function Location({ numVisits }) {
	// If we're not in admin mode or a tester, then we're at the end of the teaser.
	if (!isAdmin() && !isTester()) {
		return <>
			<Alert severity="info" sx={{ my: 2 }}>
				Gefeliciteerd! Je bent ontsnapt uit het kantoor! Maar dit was slechts de teaser...<br />
				De volledige Escape Room is nog in ontwikkeling en komt op <strong>6 januari 2025</strong> online. Vanaf dan kun je ook proberen om uit &quot;De Verlaten School&quot; te ontsnappen. Kom vooral terug!
			</Alert>
		</>
	}

	// We're in the regular operation of the Escape Room.
	return cases(numVisits, [0, 3, 6, Infinity], [
		<p>Het lokaal ziet er exact hetzelfde uit als toen je klas er nog was, behalve dan dat iedereen weg is. Tegenover je is de deur naar de gang. Links is een tussendeur naar het muzieklokaal, en rechts kun je door naar geschiedenis. De deuren kende je al, maar pas nu valt het je op dat ze ook allemaal een elektronisch kastje ernaast hebben. Zijn ze nieuw? Of vallen ze je nu pas voor het eerst op?</p>,
		<p>Het wiskundelokaal is nog steeds hetzelfde als voorheen. Net zo verlaten als de rest van de school.</p>,
		<p>Het wiskundelokaal ziet er hetzelfde uit, maar het begint op je in te werken. De posters op de muren lijken dichterbij te komen.</p>,
		<p>Je denkt, &quot;niet weer het wiskundelokaal...&quot; Je blijft hier maar terugkomen. Is het de centrale spil in deze hele situatie?</p>,
	])
}
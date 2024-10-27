
import Alert from '@mui/material/Alert'

export function Location() {
	return <>
		<Alert severity="info" sx={{ my: 2 }}>
			<p style={{ marginTop: 0 }}>Gefeliciteerd! Je bent ontsnapt uit het kantoor! Maar dit was slechts de teaser...</p>
			<p style={{ marginBottom: 0 }}>De volledige Escape Room is nog in ontwikkeling en komt op <strong>6 januari 2025</strong> online. Vanaf dan kun je ook proberen om uit &quot;De Verlaten School&quot; te ontsnappen. Kom vooral terug!</p>
		</Alert>

		{/* <p>Het lokaal ziet er exact hetzelfde uit als toen je hem verlaten had. Tegenover je is de deur naar de gang. Links is een tussendeur naar het aardrijkskundelokaal, en rechts kun je door naar natuurkunde.</p> */}
	</>
}

export function Action({ action }) {
	return <p>Je hebt het volgende gedaan: {JSON.stringify(action)}</p>
}

export function Choice() {
	return null
}

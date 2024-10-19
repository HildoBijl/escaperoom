export function Location() {
	return <>
		{/* <p>Het lokaal ziet er exact hetzelfde uit als toen je hem verlaten had. Tegenover je is de deur naar de gang. Links is een tussendeur naar het aardrijkskundelokaal, en rechts kun je door naar natuurkunde.</p> */}
		<p>Dit is voorlopig het einde van de Escape Room. Het wiskundelokaal wordt, net als de lokalen erna, binnenkort toegevoegd!</p>
	</>
}

export function Action({ action }) {
	return <p>Je hebt het volgende gedaan: {JSON.stringify(action)}</p>
}

export function Choice() {
	return null
}

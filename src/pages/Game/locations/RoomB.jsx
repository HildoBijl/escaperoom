export function Location() {
	return <p>Je bent nu in kamer B.</p>
}

export function Action({ action }) {
	return <p>Je hebt het volgende gedaan: {JSON.stringify(action)}</p>
}

export function Choice() {
	return <p>Wat ga je doen?</p>
}

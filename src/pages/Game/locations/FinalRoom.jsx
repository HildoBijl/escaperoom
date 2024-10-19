export function Location() {
	return <p>Dit is de laatste kamer. Los het eindraadsel op om te winnen.</p>
}

export function Action({ action }) {
	return <p>Je hebt het volgende gedaan: {JSON.stringify(action)}</p>
}

export function Choice() {
	return <p>Wat ga je doen?</p>
}

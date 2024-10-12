import { Link } from 'react-router-dom'

export function ErrorPage() {
	return <div style={{ alignItems: 'center', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center', minHeight: '100vh' }}>
		<h2>Oops...</h2>
		<p>We konden de opgegeven pagina niet vinden.</p>
		<p><Link to="/">Ga terug naar de Home pagina.</Link></p>
	</div>
}

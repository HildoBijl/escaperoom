import { Link } from 'react-router-dom'

import { clearRiddleStorage } from './Game/util'
import { clearHistory } from './Game/engine'

export function ErrorPage() {
	return <div style={{ alignItems: 'center', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center', minHeight: '100vh' }}>
		<h2 style={{ textAlign: 'center', margin: '0.5rem' }}>Oops...</h2>
		<p style={{ textAlign: 'center', margin: '0.5rem' }}>Er ging iets mis bij het laden van de pagina.<br />Je kunt de volgende stappen proberen om het probleem op te lossen.</p>
		<p style={{ textAlign: 'center', margin: '0.5rem' }}><Link onClick={() => window.location.reload(true)}>Vernieuw de huidige pagina (F5)</Link></p>
		<p style={{ textAlign: 'center', margin: '0.5rem' }}><Link to="/">Ga terug naar de Home pagina</Link></p>
		<p style={{ textAlign: 'center', margin: '0.5rem' }}><Link to="/spel" onClick={() => {
			clearRiddleStorage()
			clearHistory()
		}}>Herstart het Escape Room spel</Link></p>
	</div>
}

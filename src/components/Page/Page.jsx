import { Header } from '../Header'
import { Container } from '../Container'

export function Page({ children }) {
	return <>
		<Header />
		<Container>{children}</Container>
	</>
}

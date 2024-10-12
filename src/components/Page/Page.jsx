import { Top } from '../Top'
import { Container } from '../Container'

export function Page({ children }) {
	return <>
		<Top />
		<Container>{children}</Container>
	</>
}

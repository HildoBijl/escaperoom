import { Container } from '../Container'

export function Subpage({ children }) {
	return <Container sx={{ position: 'relative' }}>{children}</Container>
}

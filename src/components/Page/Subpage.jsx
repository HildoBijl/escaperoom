import { Container } from '../Container'

export function Subpage({ children }) {
	return <Container sx={{ paddingBottom: '0.5rem', position: 'relative' }}>{children}</Container>
}

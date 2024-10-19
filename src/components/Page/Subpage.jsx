import { Container } from '../Container'

export function Subpage({ children }) {
	return <Container sx={{ paddingBottom: '2rem', position: 'relative' }}>{children}</Container>
}

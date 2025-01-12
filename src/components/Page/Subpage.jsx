import { Container } from '../Container'

export function Subpage({ children }) {
	return <Container sx={{ py: '0.8rem', position: 'relative' }}>{children}</Container>
}

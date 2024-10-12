import MuiContainer from '@mui/material/Container'

export function Container({ children, ...props }) {
	return <MuiContainer maxWidth="xl" {...props}>{children}</MuiContainer>
}

import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import { tabs, useCurrentRoute, useTabIndex } from 'routing'

import { Container } from '../Container'

const tabStyle = { outline: 'none !important', minHeight: '56px' }

export function Header() {
	const theme = useTheme()
	const smallScreen = useMediaQuery(theme.breakpoints.down('sm'))

	// Determine the route and the corresponding tab index.
	const route = useCurrentRoute()
	const tabIndex = useTabIndex()

	// Set up a change handler: when the tab changes, update the URL.
	const navigate = useNavigate()
	const handleChange = (event, tabIndex) => navigate(tabs[tabIndex].path)

	// If the route indicated no header should be present, don't render a header.
	if (route.header === false)
		return null

	// Render the Header.
	return <Box>
		<AppBar position="static" enableColorOnDark>
			<Container>
				<Tabs
					value={tabIndex}
					onChange={handleChange}
					indicatorColor="secondary"
					textColor="inherit"
					variant="fullWidth"
				>
					{tabs.map(tab => <Tab sx={tabStyle} key={tab.path} icon={tab.icon ? <tab.icon /> : null} label={smallScreen ? undefined : tab.text} iconPosition="start" />)}
				</Tabs>
			</Container>
		</AppBar>
	</Box>
}

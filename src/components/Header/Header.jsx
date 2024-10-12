import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import { tabs, useCurrentRoute, useTabIndex } from 'routing'

import { Container } from '../Container'

const tabStyle = { outline: 'none !important' }

export function Header() {
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
		<AppBar position="static">
			<Container>
				<Tabs
					value={tabIndex}
					onChange={handleChange}
					indicatorColor="secondary"
					textColor="inherit"
					variant="fullWidth"
				>
					{tabs.map(tab => <Tab sx={tabStyle} key={tab.path} label={tab.text} />)}
				</Tabs>
			</Container>
		</AppBar>
	</Box>
}

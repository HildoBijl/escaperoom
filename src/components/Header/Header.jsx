import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import { Container } from '../Container'

export function Header() {
	const [value, setValue] = useState(0)
	const handleChange = (event, newValue) => {
		setValue(newValue)
	}

	return <Box>
		<AppBar position="static">
			<Container>
				<Tabs
					value={value}
					onChange={handleChange}
					indicatorColor="secondary"
					textColor="inherit"
					variant="fullWidth"
				>
					<Tab label="Home" />
					<Tab label="Escape Room" />
					<Tab label="Info" />
				</Tabs>
			</Container>
		</AppBar>
	</Box>
}

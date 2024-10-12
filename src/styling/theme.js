import { createTheme } from '@mui/material/styles'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import './main.css'

export const createCustomTheme = ({ mode }) => createTheme({
  palette: {
    primary: {
      main: '#242424',
    },
    secondary: {
      main: '#888888',
    },
    mode,
  },
})

import { createTheme } from '@mui/material/styles'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import './main.css'

export const createCustomTheme = ({ mode }) => createTheme({
  palette: {
    primary: {
      main: '#223e7d',
    },
    secondary: {
      main: '#79b4db',
    },
    mode,
  },
})

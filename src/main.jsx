import React from 'react'
import ReactDOM from 'react-dom/client'

import { ThemeProvider } from './styling'
import { App } from './components'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
  </React.StrictMode>,
)

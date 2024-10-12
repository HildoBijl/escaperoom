import { createBrowserRouter } from 'react-router-dom'

import { Home, About, Game } from './pages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/game',
    element: <Game />,
  },
  {
    path: '/about',
    element: <About />,
  },
])

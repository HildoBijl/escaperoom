import { Page } from 'components'
import { ErrorPage, Home, About, Game, Leaderboard } from 'pages'

export const routes = [
	{
		path: '/',
		element: <Page />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: '/',
				element: <Home />,
				tabIndex: 0,
			},
			{
				path: '/spel',
				element: <Game />,
				tabIndex: 1,
			},
			{
				path: '/info',
				element: <About />,
				tabIndex: 2,
			},
			{
				path: '/leaderboard',
				element: <Leaderboard />,
				tabIndex: 3,
			},
			{
				path: '*',
				element: <Home />,
				tabIndex: 0,
			},
		],
	},
]

import { Page } from 'components'
import { ErrorPage, Home, About, Game } from 'pages'

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
				path: '*',
				element: <Home />,
				tabIndex: 0,
			},
		],
	},
]

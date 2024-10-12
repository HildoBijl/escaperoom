import { useMatches } from 'react-router-dom'

import { lastOf } from 'util'

import { routes } from './routes'
import { tabs } from './tabs'

export function useCurrentRoutes() {
	const matches = useMatches()
	const path = matches[matches.length - 1].id.split('-')
	const currentRoutes = []
	let currentRoute
	path.forEach((child, index) => {
		if (index === 0)
			currentRoute = routes[parseInt(child)]
		else
			currentRoute = currentRoute.children[parseInt(child)]
		currentRoutes.push(currentRoute)
	})
	return currentRoutes
}

export function useCurrentRoute() {
	const currentRoutes = useCurrentRoutes()
	return lastOf(currentRoutes)
}

export function useTabIndex() {
	const routes = useCurrentRoutes()
	const getTabIndex = route => tabs.indexOf(route.path)
	const route = [...routes].reverse().find(route => getTabIndex(route) !== -1)
	return route ? getTabIndex(route) : 0
}

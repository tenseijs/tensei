import ReactDOM from 'react-dom'
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route as RouteComponent } from 'react-router-dom'

import { Route, RouteGroup } from './types'

import Page from './Page'

const getRoutes = (routes: Route[]) => {
    const routesMap: RouteGroup = {}

    routes.forEach(route => {
        if (routesMap[route.group]) {
            routesMap[route.group] = {
                routes: [...routesMap[route.group].routes, route],
                slug: route.groupSlug,
                name: route.group
            }
        } else {
            routesMap[route.group] = {
                routes: [route],
                slug: route.groupSlug,
                name: route.group
            }
        }
    })

    return routesMap
}

const App = () => {
    const [routes, setRoutes] = useState<RouteGroup>({})

    useEffect(() => {
        fetch('/rest/routes')
            .then(response => response.json())
            .then(routesList => {
                setRoutes(getRoutes(routesList))
            })
    }, [])

    if (Object.keys(routes).length === 0) {
        return null
    }

    return (
        <div className="pt-16 text-tensei-gray-900">
            <nav className="fixed top-0 z-40 w-full border-b bg-white">
                <div className="max-w-6xl mx-auto flex-1 px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="lg:w-1/5 flex items-center pr-4">
                            <a
                                href=""
                                className="flex-shrink-0 flex-1 font-bold text-xl nuxt-link-exact-active nuxt-link-active"
                            >
                                <img
                                    src="https://res.cloudinary.com/bahdcoder/image/upload/v1604236130/Asset_1_4x_fhcfyg.png"
                                    className="h-8 max-w-full"
                                    alt="Tensei logo"
                                />
                            </a>
                        </div>

                        <div className="flex-1 flex justify-start w-4/6"></div>

                        <div className="lg:w-full"></div>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 lg:px-8">
                <div className="flex flex-wrap relative">
                    <RouteComponent
                        path={`/rest-docs/:group?`}
                        component={() => <Page routeGroups={routes} />}
                    />
                </div>
            </main>
        </div>
    )
}

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('app')
)

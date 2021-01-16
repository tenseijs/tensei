import React, { Fragment } from 'react'
import { Link, Route, useLocation, Switch } from 'react-router-dom'

interface SettingsPageProps {}

import { CmsRoute } from '@tensei/components'

const getGroups = () => {
    let groups: {
        [key: string]: CmsRoute[]
    } = {}
    const routes = window.Tensei.ctx.routes.filter(r => r.settings)

    routes.forEach(route => {
        groups[route.group] = [...(groups[route.group] || []), route]
    })

    return groups
}

const Settings: React.FC<SettingsPageProps> = () => {
    const location = useLocation()
    const groups = getGroups()

    return (
        <div className="h-full flex overflow-hidden">
            <div className="hidden bg-white border-r border-tensei-gray-400 md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4"></div>
                        <div className="mt-5 flex-1 flex flex-col">
                            {Object.keys(groups).map(groupKey => {
                                const group = groups[groupKey]

                                if (group.length === 0) {
                                    return null
                                }

                                return (
                                    <div
                                        className="mb-5"
                                        key={groupKey.toLowerCase()}
                                    >
                                        <div className="px-6 py-3 text-left text-xs font-extrabold text-tensei-darkest uppercase tracking-wider">
                                            {groupKey}
                                        </div>

                                        {group.map(route => {
                                            const active =
                                                route.path === location.pathname

                                            const canSee =
                                                route.requiredPermissions
                                                    .length === 0 ||
                                                route.requiredPermissions
                                                    .map(permission =>
                                                        window.Tensei.state.admin.admin_permissions.includes(
                                                            permission
                                                        )
                                                    )
                                                    .filter(Boolean).length ===
                                                    route.requiredPermissions
                                                        .length

                                            if (!canSee) {
                                                return null
                                            }

                                            return (
                                                <Link
                                                    to={route.path}
                                                    key={route.path}
                                                    className={`
                                                    relative w-full cursor-pointer text-tensei-darkest font-semibold flex items-center justify-between py-3 px-10 cursor-pointer transition ease-in-out hover:bg-tensei-primary hover:bg-opacity-10
                    
                                                    ${
                                                        active
                                                            ? 'bg-tensei-primary bg-opacity-10'
                                                            : ''
                                                    }
                                                    `}
                                                >
                                                    {route.name}
                                                    {active ? (
                                                        <span className="absolute h-full w-1 right-0 bg-tensei-primary"></span>
                                                    ) : null}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="p-6 md:p-12">
                    <Switch>
                        {window.Tensei.ctx.routes
                            .filter(r => r.settings)
                            .map(route => (
                                <Route
                                    key={route.path}
                                    path={route.path}
                                    exact={route.exact}
                                    component={route.component}
                                />
                            ))}
                    </Switch>
                </div>
            </div>
        </div>
    )
}

export default Settings

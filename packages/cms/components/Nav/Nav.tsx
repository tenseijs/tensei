import React, { useState, Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ResourceContract, CmsRoute, Icon } from '@tensei/components'

export interface NavProps {
    className: string
}

import NavLink from '../NavLink'
import NavGroup from '../NavGroup'

const getGroups = () => {
    const { resources } = window.Tensei.state

    const sidebarResources = resources.filter(r => r.displayInNavigation)

    let groups: {
        slug: string
        label: string
        active?: boolean
        routes: CmsRoute[]
    }[] = []

    sidebarResources.forEach(resource => {
        if (resource.group && resource.groupSlug) {
            const resourceRoute = {
                settings: false,
                group: resource.group,
                name: resource.label,
                icon: resource.icon,
                path: window.Tensei.getPath(`resources/${resource.slug}`),
                requiredPermissions: [`index:${resource.slug}`],
                component: () => <p></p>
            }

            const existingGroup = groups.findIndex(
                g => g.slug === resource.groupSlug
            )

            if (existingGroup === -1) {
                groups.push({
                    active: true,
                    slug: resource.groupSlug,
                    label: resource.group,
                    routes: [resourceRoute]
                })
            } else {
                groups[existingGroup] = {
                    ...groups[existingGroup],
                    routes: [...groups[existingGroup].routes, resourceRoute]
                }
            }
        }
    })

    const routes = window.Tensei.ctx.routes.filter(r => !r.settings)

    routes.forEach(route => {
        if (route.group) {
            const existingGroup = groups.findIndex(g => g.label === route.group)

            if (existingGroup === -1) {
                groups.push({
                    label: route.group,
                    slug: '',
                    active: true,
                    routes: [route]
                })
            } else {
                groups[existingGroup] = {
                    ...groups[existingGroup],
                    routes: [...groups[existingGroup].routes, route]
                }
            }
        }
    })

    return groups
}

const Nav: React.FC<NavProps> = ({ className }) => {
    const location = useLocation()
    const [groups, setGroups] = useState(getGroups())

    return (
        <nav className={className}>
            <div className="w-full">
                {window.Tensei.ctx.routes
                    .filter(route => !route.group)
                    .map(route => (
                        <NavLink
                            to={route.path}
                            key={route.path}
                            icon={route.icon as any}
                            name={route.name}
                            active={
                                location.pathname === route.path ||
                                location.pathname ===
                                    `${route.path.slice(0, -1)}`
                            }
                        />
                    ))}
                {groups.map((group, index) => {
                    const onGroupToggle = () => {
                        setGroups(
                            groups.map((g, i) =>
                                i === index ? { ...g, active: !g.active } : g
                            )
                        )
                    }

                    const groupRoutes = group.routes.filter(
                        route =>
                            route.requiredPermissions.length === 0 ||
                            route.requiredPermissions
                                .map(p =>
                                    window.Tensei.state.admin.admin_permissions.includes(
                                        p
                                    )
                                )
                                .filter(Boolean).length ===
                                route.requiredPermissions.length
                    )

                    if (groupRoutes.length === 0) {
                        return null
                    }

                    return (
                        <Fragment key={group.label}>
                            <NavGroup
                                onClick={() => {
                                    onGroupToggle()
                                }}
                                onKeyPress={event => {
                                    if (event.keyCode === 0) {
                                        onGroupToggle()
                                    }
                                }}
                                active={group.active}
                                name={group.label}
                            />
                            {group.active &&
                                groupRoutes.map(route => {
                                    const linkActive = location.pathname.includes(
                                        route.path
                                    )

                                    return (
                                        <NavLink
                                            key={route.path}
                                            to={route.path}
                                            active={linkActive}
                                            icon={route.icon as any}
                                            name={route.name}
                                        />
                                    )
                                })}
                        </Fragment>
                    )
                })}
            </div>
        </nav>
    )
}

export default Nav

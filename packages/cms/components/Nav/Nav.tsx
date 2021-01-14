import React, { useState, Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ResourceContract, Transition, Icon } from '@tensei/components'

export interface NavProps {
    className: string
}

const getGroups = () => {
    const { resources } = window.Tensei.state

    const sidebarResources = resources.filter(r => r.displayInNavigation)

    let groups: {
        [key: string]: {
            slug: string
            label: string
            resources: ResourceContract[]
            active?: boolean
        }
    } = {}

    sidebarResources.forEach(resource => {
        if (resource.group && resource.groupSlug) {
            groups[resource.groupSlug] = {
                slug: resource.groupSlug,
                label: resource.group,
                resources: [
                    ...((groups[resource.groupSlug] || {}).resources || []),
                    resource
                ],
                active: true
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
                {Object.keys(groups)
                    .sort()
                    .map(groupSlug => {
                        const group = groups[groupSlug]

                        const onGroupToggle = () => {
                            setGroups({
                                ...groups,
                                [groupSlug]: {
                                    ...group,
                                    active: !group.active
                                }
                            })
                        }

                        return (
                            <Fragment key={groupSlug}>
                                <div
                                    tabIndex={0}
                                    onClick={() => {
                                        setGroups({
                                            ...groups,
                                            [groupSlug]: {
                                                ...group,
                                                active: !group.active
                                            }
                                        })
                                    }}
                                    onKeyPress={event => {
                                        if (event.keyCode === 0) {
                                            onGroupToggle()
                                        }
                                    }}
                                    className="cursor-pointer focus:outline-none px-10 py-3 w-full flex items-center justify-between text-white cursor-pointer group hover:bg-tensei-primary hover:bg-opacity-10 transition ease-in-out duration-75"
                                >
                                    <span className="font-medium">
                                        {group.label}
                                    </span>
                                    <svg
                                        width={12}
                                        height={12}
                                        viewBox="0 0 12 9"
                                        className={`fill-current transition ease-in-out ${
                                            group.active
                                                ? 'transform rotate-180'
                                                : ''
                                        }`}
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M1.41 0.840027L6 5.42003L10.59 0.840027L12 2.25003L6 8.25003L0 2.25003L1.41 0.840027Z" />
                                    </svg>
                                </div>
                                {group.active &&
                                    group.resources.map(resource => {
                                        const linkActive = location.pathname.includes(
                                            window.Tensei.getPath(
                                                `resources/${resource.slug}`
                                            )
                                        )

                                        return (
                                            <Link
                                                key={resource.slug}
                                                to={window.Tensei.getPath(
                                                    `resources/${resource.slug}`
                                                )}
                                                className={`w-full cursor-pointer flex items-center justify-between py-3 px-10 cursor-pointer transition ease-in-out hover:bg-tensei-primary hover:bg-opacity-10 ${
                                                    linkActive
                                                        ? 'relative font-bold text-white bg-tensei-primary bg-opacity-10'
                                                        : 'text-tensei-gray-700 '
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <Icon
                                                        icon={
                                                            resource.icon as any
                                                        }
                                                        active={linkActive}
                                                    />{' '}
                                                    <span className="ml-4">
                                                        {resource.label}
                                                    </span>
                                                </div>

                                                {linkActive ? (
                                                    <span className="absolute h-full w-1 left-0 bg-tensei-primary"></span>
                                                ) : null}
                                            </Link>
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

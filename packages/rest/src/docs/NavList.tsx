import React from 'react'
import { Link, useParams } from 'react-router-dom'

import { Route } from './types'

interface NavLinkProps {
    routesGroup: {
        [key: string]: {
            routes: Route[]
            slug: string
        }
    }
}

const NavList: React.FC<NavLinkProps> = ({ routesGroup }) => {
    const { group } = useParams<{
        group: string
    }>()

    return (
        <>
            {Object.keys(routesGroup).map(groupName => {
                return (
                    <li key={groupName} className="text-tensei-gray-900">
                        <Link
                            to={`/rest-docs/${routesGroup[groupName].slug}`}
                            className={`px-2 rounded font-medium py-1 flex items-center justify-between hover:text-tensei-primary ${
                                routesGroup[groupName].slug === group
                                    ? 'text-tensei-primary bg-tensei-primary bg-opacity-10'
                                    : ''
                            }`}
                        >
                            {groupName}
                        </Link>
                    </li>
                )
            })}
        </>
    )
}

export default NavList

import React from 'react'
import { Link } from 'react-router-dom'

import { Route } from './types'

interface OnThisPageProps {
    routeGroup: {
        routes: Route[]
        slug: string
    }
}

const OnThisPage: React.FC<OnThisPageProps> = ({ routeGroup }) => {
    return (
        <ul className="scrollactive-nav">
            {routeGroup.routes.map(route => (
                <li
                    key={route.id}
                    className="border-t border-dashed first:border-t-0"
                >
                    <a
                        href={`#${route.paramCaseName}`}
                        className="block text-sm scrollactive-item transition-padding ease-in-out duration-300 hover:pl-1 py-2 "
                    >
                        {route.name}
                    </a>
                </li>
            ))}
        </ul>
    )
}

export default OnThisPage

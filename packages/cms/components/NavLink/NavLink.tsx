import React from 'react'
import { Link } from 'react-router-dom'

import { Icon } from '@tensei/components'

interface NavLinkProps {
    to: string
    name: string
    icon?: string
    active?: boolean
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, icon, name }) => {
    return (
        <Link
            to={to}
            className={`w-full cursor-pointer flex items-center justify-between py-3 px-10 cursor-pointer transition ease-in-out hover:bg-tensei-primary hover:bg-opacity-10 ${
                active
                    ? 'relative font-bold text-white bg-tensei-primary bg-opacity-10'
                    : 'text-tensei-gray-700 '
            }`}
        >
            <div className="flex items-center">
                {' '}
                {icon && <Icon icon={icon as any} active={active} />}
                <span className="ml-4">{name}</span>
            </div>

            {active ? (
                <span className="absolute h-full w-1 left-0 bg-tensei-primary"></span>
            ) : null}
        </Link>
    )
}

export default NavLink

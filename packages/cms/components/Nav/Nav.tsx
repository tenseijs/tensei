import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@tensei/components'

export interface NavProps {
    className: string
}

const Nav: React.FC<NavProps> = ({ className }) => {
    return (
        <nav className={className}>
            <div className="w-full">
                <div className="px-10 w-full flex items-center justify-between text-white cursor-pointer group">
                    <span className="font-medium text-xs">Dashboards</span>
                    <svg
                        width={12}
                        height={12}
                        viewBox="0 0 12 9"
                        className="fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M1.41 0.840027L6 5.42003L10.59 0.840027L12 2.25003L6 8.25003L0 2.25003L1.41 0.840027Z" />
                    </svg>
                </div>

                <Link
                    to={window.Tensei.getPath('resources/beans')}
                    className="relative w-full flex items-center justify-between text-xs text-white bg-tensei-primary py-3 px-10 cursor-pointer mt-4 bg-opacity-10"
                >
                    <div className="flex items-center">
                        <Icon active icon="tag" />{' '}
                        <span className="ml-4">Main</span>
                    </div>

                    <span className="absolute h-full w-1 left-0 bg-tensei-primary"></span>
                </Link>

                <Link
                    to={window.Tensei.getPath('resources/okto')}
                    className="w-full flex items-center justify-between text-xs text-tensei-gray-700 py-3 px-10 cursor-pointer transition ease-in-out hover:bg-tensei-primary hover:bg-opacity-10"
                >
                    <div className="flex items-center">
                        <Icon icon="grid" /> <span className="ml-4">Main</span>
                    </div>
                </Link>
            </div>
        </nav>
    )
}

export default Nav

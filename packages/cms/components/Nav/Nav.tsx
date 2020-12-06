import React from 'react'

export interface NavProps {
    className: string
}

const Nav: React.FC<NavProps> = ({ className }) => {
    return (
        <nav className={className}>
            <div className="w-full">
                <div className="px-6 w-full flex items-center justify-between text-white cursor-pointer group">
                    <span className="font-medium text-sm">DASHBOARDS</span>
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

                <div className="w-full flex items-center justify-between text-sm text-white bg-tensei-primary py-3 px-6 cursor-pointer mt-4 bg-opacity-10">
                    Main
                </div>
                <div className="w-full flex items-center justify-between text-sm text-tensei-gray-700 py-3 px-6 cursor-pointer">
                    Tags
                </div>
                <div className="w-full flex items-center justify-between text-sm text-tensei-gray-700 py-3 px-6 cursor-pointer">
                    Posts
                </div>
                <div className="w-full flex items-center justify-between text-sm text-tensei-gray-700 py-3 px-6 cursor-pointer">
                    Performance
                </div>
            </div>
        </nav>
    )
}

export default Nav

import React from 'react'

interface NavGroupProps {
    name: string
    active?: boolean
    onClick?: () => void
    onKeyPress?: (event: any) => void
}

const NavGroup: React.FC<NavGroupProps> = ({
    active,
    name,
    onClick,
    onKeyPress
}) => {
    return (
        <div
            tabIndex={0}
            onClick={onClick}
            onKeyPress={onKeyPress}
            className="cursor-pointer focus:outline-none px-10 py-3 w-full flex items-center justify-between text-white cursor-pointer group hover:bg-tensei-primary hover:bg-opacity-10 transition ease-in-out duration-75"
        >
            <span className="font-medium">{name}</span>
            <svg
                width={12}
                height={12}
                viewBox="0 0 12 9"
                className={`fill-current transition ease-in-out ${
                    active ? 'transform rotate-180' : ''
                }`}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M1.41 0.840027L6 5.42003L10.59 0.840027L12 2.25003L6 8.25003L0 2.25003L1.41 0.840027Z" />
            </svg>
        </div>
    )
}

export default NavGroup

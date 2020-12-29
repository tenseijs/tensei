import React from 'react'

export interface ButtonProps {
    onClick?: () => void
    disabled?: boolean
    type?: 'submit' | 'button'
    clear?: boolean
    primary?: boolean
    danger?: boolean
    className?: string
    as?: React.ReactElement
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    type = 'button',
    disabled,
    clear,
    primary,
    danger,
    className
}) => {
    const props = {
        onClick,
        type,
        disabled,
        className
    }

    const classes = {
        primary:
            'flex items-center w-full md:w-auto leading-5 px-8 py-2 text-white sm:text-sm bg-tensei-primary rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tensei-primary transition ease-in-out hover:bg-tensei-primary-darker',
        danger:
            'inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-10 py-2 bg-red-600 text-base font-medium text-white transition ease-in-out hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm',
        clear:
            'mt-3 w-full inline-flex justify-center rounded-md border border-tensei-gray-600 px-10 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tensei-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
    }

    if (clear) {
        props.className = `${props.className || ''} ${classes.clear}`
    }

    if (primary) {
        props.className = `${props.className || ''} ${classes.primary}`
    }

    if (danger) {
        props.className = `${props.className || ''} ${classes.danger}`
    }

    return <button {...props}>{children}</button>
}

export default Button

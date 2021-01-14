import React from 'react'
import Pulse from '../Pulse'

export interface ButtonProps {
    onClick?: () => void
    disabled?: boolean
    type?: 'submit' | 'button'
    clear?: boolean
    primary?: boolean
    danger?: boolean
    className?: string
    loading?: boolean
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
    loading,
    className
}) => {
    const props = {
        onClick,
        type,
        className,
        disabled: disabled || loading
    }

    const classes = {
        primary: `flex items-center justify-center w-full md:w-auto leading-5 px-6 ${
            props.disabled
                ? 'cursor-not-allowed bg-tensei-primary-lighter'
                : 'bg-tensei-primary hover:bg-tensei-primary-darker'
        } text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tensei-primary transition ease-in-out`,
        danger: `inline-flex justify-center w-full rounded-lg border border-transparent shadow-sm px-6 ${
            props.disabled
                ? 'cursor-not-allowed bg-red-500'
                : 'bg-red-600 hover:bg-red-700'
        } font-medium text-white transition ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto`,
        clear: `w-full inline-flex justify-center rounded-lg border border-tensei-gray-600 px-6 ${
            props.disabled ? 'cursor-not-allowed bg-tensei-primary-lighter' : ''
        } bg-tensei-gray-600 font-medium text-tensei-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tensei-primary sm:mt-0 sm:ml-3 sm:w-auto`
    }

    if (clear) {
        props.className = `font-bold h-9 flex items-center ${
            props.className || ''
        } ${classes.clear}`
    }

    if (primary) {
        props.className = `font-bold h-9 flex items-center ${
            props.className || ''
        } ${classes.primary}`
    }

    if (danger) {
        props.className = `font-bold h-9 flex items-center ${
            props.className || ''
        } ${classes.danger}`
    }

    return (
        <button {...props}>
            {loading ? (
                <Pulse dotClassName="bg-white" height="10px" dotHeight="100%" />
            ) : (
                children
            )}
        </button>
    )
}

export default Button

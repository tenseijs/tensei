import React from 'react'

const Button: React.FC<{
    className?: string
}> = ({ children, className }) => {
    return (
        <button
            className={`${className} inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest focus:outline-none transition ease-in-out duration-150 bg-gray-800`}
        >
            {children}
        </button>
    )
}

export default Button

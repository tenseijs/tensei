import React from 'react'

const ArrowIcon = ({ className }) => {
    return (
        <svg
            className={`w-4 h-4 ${className}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path d="M19 9l-7 7-7-7" />
        </svg>
    )
}

export default ArrowIcon

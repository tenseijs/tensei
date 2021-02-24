import React from 'react'

const Feature: React.FC<{
    className?: string
}> = ({ children, className }) => {
    return (
        <div className="flex items-center">
            <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="text-green-400 w-5 h-5"
            >
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                ></path>
            </svg>

            <div className="ml-2 text-sm text-gray-600">feature one</div>
        </div>
    )
}

export default Feature

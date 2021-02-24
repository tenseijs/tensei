import React from 'react'

const SectionHeading: React.FC<{
    className?: string
}> = ({ children, className }) => {
    return (
        <h1 className={`text-2xl font-semibold text-gray-700 ${className}`}>
            {children}
        </h1>
    )
}

export default SectionHeading

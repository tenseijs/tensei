import React from 'react'

export interface LabelProps {
    id: string
    label: string
    className?: string
    hiddenLabel?: boolean
}

const Label: React.FC<LabelProps> = ({
    id,
    label,
    hiddenLabel,
    className = ''
}) => {
    return (
        <label
            htmlFor={id}
            className={
                hiddenLabel
                    ? 'sr-only'
                    : `font-semibold text-tensei-darkest block mb-2 ${className}`
            }
        >
            {label}
        </label>
    )
}

export default Label

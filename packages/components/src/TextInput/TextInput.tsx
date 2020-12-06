import React, { ReactNode } from 'react'

export interface TextInputProps {
    className?: string
    label: string
    name: string
    id: string
    hiddenLabel?: boolean
    addonAfter?: ReactNode
}

const TextInput: React.FC<TextInputProps> = ({
    className = '',
    label,
    name,
    id,
    addonAfter,
    hiddenLabel
}) => {
    return (
        <div className={className}>
            <label htmlFor={name} className={hiddenLabel ? 'sr-only' : ''}>
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    name={name}
                    className="rounded-sm block w-full pr-10 pl-3 py-2 leading-5 bg-white focus:outline-none focus:placeholder-gray-700 focus:ring-1 focus:ring-tensei-primary border-tensei-gray-800 focus:border-tensei-primary sm:text-sm"
                    placeholder="Search"
                    type="search"
                />
                {addonAfter ? (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {addonAfter}
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default TextInput

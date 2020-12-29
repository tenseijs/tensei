import React, { ReactNode } from 'react'

export interface TextInputProps {
    id: string
    name: string
    label: string
    rows?: number
    cols?: number
    className?: string
    placeholder?: string
    hiddenLabel?: boolean
    addonAfter?: ReactNode
}

const Textarea: React.FC<TextInputProps> = ({
    id,
    name,
    cols,
    label,
    rows = 5,
    placeholder,
    hiddenLabel,
    className = ''
}) => {
    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={name}
                    className={
                        hiddenLabel
                            ? 'sr-only'
                            : 'text-tensei-darkest inline-block mb-2'
                    }
                >
                    {label}
                </label>
            )}
            <textarea
                id={id}
                name={name}
                rows={rows}
                cols={cols}
                placeholder={placeholder}
                className="rounded-md block w-full pr-10 pl-3 leading-5 bg-white focus:outline-none placeholder-tensei-gray-700 focus:ring-1 focus:ring-tensei-primary border border-tensei-gray-400 focus:border-tensei-primary sm:text-sm"
            />
        </div>
    )
}

export default Textarea

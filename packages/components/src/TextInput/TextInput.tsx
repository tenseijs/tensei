import React, { ReactNode } from 'react'
import { ChangeEventHandler } from 'react'

export interface TextInputProps {
    id: string
    name: string
    type?: string
    label: string
    error?: string
    value?: string
    className?: string
    placeholder?: string
    hiddenLabel?: boolean
    roundedFull?: boolean
    addonAfter?: ReactNode
    onChange?: ChangeEventHandler<HTMLInputElement>
}

const TextInput: React.FC<TextInputProps> = ({
    id,
    name,
    label,
    error,
    value,
    onChange,
    roundedFull,
    placeholder,
    hiddenLabel,
    type = 'text',
    className = ''
}) => {
    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={id}
                    className={
                        hiddenLabel
                            ? 'sr-only'
                            : 'text-tensei-darkest block mb-2'
                    }
                >
                    {label}
                </label>
            )}
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`${
                    roundedFull ? 'rounded-full' : 'rounded-md'
                } block w-full pr-10 pl-3 h-10 leading-5 bg-white focus:outline-none placeholder-tensei-gray-700 ${
                    error
                        ? 'border-2 border-tensei-error '
                        : 'focus:ring-tensei-primary border border-tensei-gray-600 focus:border-tensei-primary focus:ring-1 '
                } sm:text-sm`}
            />

            {error ? (
                <i className="text-tensei-error inline-block mt-2 text-sm">
                    {error}
                </i>
            ) : null}
        </div>
    )
}

export default TextInput

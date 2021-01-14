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
    inputClassName?: string
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
    className = '',
    inputClassName,
    ...rest
}) => {
    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={id}
                    className={
                        hiddenLabel
                            ? 'sr-only'
                            : 'font-semibold text-tensei-darkest block mb-2'
                    }
                >
                    {label}
                </label>
            )}
            <input
                {...rest}
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
                        : 'focus:ring-tensei-primary border border-tensei-gray-500 focus:border-tensei-primary focus:ring-1 '
                } ${inputClassName || ''}`}
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

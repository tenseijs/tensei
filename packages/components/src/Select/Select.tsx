import React, { Fragment } from 'react'
import { ChangeEventHandler } from 'react'

interface SelectOption {
    label: string
    value: string | number
}

export interface SelectProps {
    name?: string
    id?: string
    label?: string
    className?: string
    roundedFull?: boolean
    value?: string | number
    options?: SelectOption[]
    onChange?: ChangeEventHandler<HTMLSelectElement>
}

const Select: React.FC<SelectProps> = ({
    name,
    id,
    label,
    className,
    roundedFull,
    options = [],
    onChange,
    value
}) => {
    return (
        <Fragment>
            {label ? (
                <label
                    htmlFor={id || name}
                    className="text-tensei-darkest block mb-2"
                >
                    {label}
                </label>
            ) : null}
            <select
                value={value}
                id={id || name}
                name={name || id}
                onChange={onChange}
                className={`${
                    className || ''
                } mt-1 block w-full pl-5 pr-12 h-10 text-base focus:outline-none focus:ring-1 focus:ring-tensei-primary border-tensei-gray-800 focus:border-tensei-primary sm:text-sm ${
                    roundedFull ? 'rounded-full' : 'rounded-md'
                }`}
            >
                {options.map(option => (
                    <option value={option.value} key={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </Fragment>
    )
}

export default Select

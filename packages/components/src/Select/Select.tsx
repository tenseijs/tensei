import React from 'react'

export interface SelectProps {
    name?: string
    id?: string
    label?: string
}

const Select: React.FC<SelectProps> = ({ name, id, label }) => {
    return (
        <div>
            {label ? (
                <label
                    htmlFor={id || name}
                    className="block text-sm font-medium text-gray-700"
                >
                    {label}
                </label>
            ) : null}
            <select
                id={id || name}
                name={name || id}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-1 focus:ring-tensei-primary border-tensei-gray-800 focus:border-tensei-primary  sm:text-sm rounded-sm"
            >
                <option>5 / page</option>
                <option>10 / page</option>
                <option>50 / page</option>
            </select>
        </div>
    )
}

export default Select

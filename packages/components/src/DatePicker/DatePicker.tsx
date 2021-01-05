import React from 'react'
import Flatpickr from 'react-flatpickr'

export interface DatePickerProps {
    id?: string
    name?: string
    label?: string
    className?: string
    placeholder?: string
    time_24hr?: boolean
    enableTime?: boolean
}

const DatePicker: React.FC<DatePickerProps> = ({
    label,
    id,
    name,
    className,
    enableTime,
    time_24hr
}) => {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="text-tensei-darkest block mb-2">
                    {label}
                </label>
            )}
            <div className="block w-full">
                <Flatpickr
                    options={{
                        enableTime,
                        time_24hr
                    }}
                    id={id}
                    name={name}
                    className="rounded-md block w-full pr-10 pl-3 h-10 leading-5 bg-white focus:outline-none placeholder-tensei-gray-700 focus:ring-1 focus:ring-tensei-primary border border-tensei-gray-600 focus:border-tensei-primary sm:text-sm"
                />
            </div>
        </div>
    )
}

export default DatePicker

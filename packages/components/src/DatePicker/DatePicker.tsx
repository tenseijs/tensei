import React from 'react'
import Flatpickr from 'react-flatpickr'
import { AbstractData } from '../types'

export interface DatePickerProps {
  id?: string
  value?: any
  name?: string
  label?: string
  error?: string
  className?: string
  placeholder?: string
  time_24hr?: boolean
  enableTime?: boolean
  pickerOptions?: AbstractData
  onChange?: (value: any) => void
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  id,
  name,
  error,
  value,
  onChange,
  className,
  time_24hr,
  enableTime,
  pickerOptions = {}
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="font-semibold text-tensei-darkest block mb-2"
        >
          {label}
        </label>
      )}
      <div className="block w-full">
        <Flatpickr
          data-enable-time
          options={{
            enableTime,
            time_24hr,
            ...pickerOptions
          }}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`rounded-md block w-full pr-10 pl-3 h-10 leading-5 bg-white focus:outline-none placeholder-tensei-gray-700 focus:ring-1
                        ${
                          error
                            ? 'border-2 border-tensei-error '
                            : 'focus:ring-tensei-primary border border-tensei-gray-500 focus:border-tensei-primary'
                        }
                    `}
        />

        {error ? (
          <i className="text-tensei-error inline-block mt-2 text-sm">{error}</i>
        ) : null}
      </div>
    </div>
  )
}

export default DatePicker

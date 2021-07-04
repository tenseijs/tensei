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
  error?: string
  hideFirstOption?: boolean
  placeholder?: string
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
  value,
  error,
  placeholder,
  hideFirstOption,
  ...rest
}) => {
  return (
    <Fragment>
      {label ? (
        <label
          htmlFor={id || name}
          className="font-semibold text-tensei-darkest block mb-2"
        >
          {label}
        </label>
      ) : null}
      <select
        {...rest}
        value={value}
        id={id || name}
        name={name || id}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-1 block w-full pl-5 pr-12 h-10 text-base focus:outline-none focus:ring-1 focus:ring-tensei-primary focus:border-tensei-primary ${
          roundedFull ? 'rounded-full' : 'rounded-md'
        } ${className || ''} 
                ${
                  error
                    ? 'border-2 border-tensei-error'
                    : `focus:ring-tensei-primary focus:border-tensei-primary focus:ring-1 ${
                        roundedFull
                          ? 'border-tensei-gray-600'
                          : 'border-tensei-gray-500'
                      }`
                }
                `}
      >
        {!hideFirstOption ? <option value="">Select {name}</option> : null}
        {options.map(option => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <i className="text-tensei-error inline-block mt-2 text-sm">{error}</i>
      ) : null}
    </Fragment>
  )
}

export default Select

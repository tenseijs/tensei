import React, { ReactNode } from 'react'
import { ChangeEventHandler } from 'react'

export interface TextInputProps {
  id: string
  name: string
  label: string
  rows?: number
  cols?: number
  error?: string
  value?: string
  className?: string
  placeholder?: string
  hiddenLabel?: boolean
  addonAfter?: ReactNode
  onChange?: ChangeEventHandler<HTMLTextAreaElement>
}

const Textarea: React.FC<TextInputProps> = ({
  id,
  name,
  cols,
  label,
  value,
  error,
  rows = 5,
  placeholder,
  hiddenLabel,
  className = '',
  onChange
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className={
            hiddenLabel
              ? 'sr-only'
              : 'font-semibold text-tensei-darkest block mb-2'
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
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
                    rounded-md block w-full pr-10 pl-3 py-4 leading-5 bg-white focus:outline-none placeholder-tensei-gray-700 focus:ring-1

                    ${
                      error
                        ? 'border-2 border-tensei-error '
                        : 'focus:ring-tensei-primary border border-tensei-gray-500 focus:border-tensei-primary focus:ring-1 '
                    }
                `}
      />

      {error ? (
        <i className="text-tensei-error inline-block mt-2 text-sm">{error}</i>
      ) : null}
    </div>
  )
}

export default Textarea

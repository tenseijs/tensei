import React from 'react'
import Pulse from '../Pulse'

export interface ButtonProps {
  onClick?: () => void
  disabled?: boolean
  type?: 'submit' | 'button'
  clear?: boolean
  primary?: boolean
  danger?: boolean
  success?: boolean
  className?: string
  loading?: boolean
  secondary?: boolean
  as?: React.ReactElement
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled,
  clear,
  primary,
  danger,
  loading,
  className,
  success,
  secondary
}) => {
  const props = {
    onClick,
    type,
    className,
    disabled: disabled || loading
  }

  const classes = {
    primary: `flex items-center justify-center w-full md:w-auto ${
      props.disabled
        ? 'cursor-not-allowed bg-tensei-primary-lighter'
        : 'bg-tensei-primary hover:bg-tensei-primary-darker'
    } text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tensei-primary transition ease-in-out`,
    secondary: `flex items-center justify-center w-full md:w-auto ${
      props.disabled
        ? 'cursor-not-allowed opacity-50'
        : 'bg-transparent hover:bg-tensei-primary-darker hover:bg-opacity-20'
    } text-white border border-tensei-primary rounded text-tensei-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tensei-primary transition ease-in-out`,
    danger: `inline-flex justify-center w-full rounded border border-transparent shadow-sm ${
      props.disabled
        ? 'cursor-not-allowed bg-red-500'
        : 'bg-red-600 hover:bg-red-700'
    } text-white transition ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto`,
    clear: `w-full inline-flex justify-center rounded border border-tensei-gray-600 ${
      props.disabled ? 'cursor-not-allowed bg-tensei-primary-lighter' : ''
    } bg-tensei-gray-600 text-tensei-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tensei-primary sm:mt-0 sm:ml-3 sm:w-auto`,
    success: `flex items-center justify-center w-full md:w-auto ${
      props.disabled
        ? 'cursor-not-allowed bg-tensei-success-lighter'
        : 'bg-tensei-success hover:bg-tensei-success-darker'
    } text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tensei-success transition ease-in-out`
  }

  if (clear) {
    props.className = `${props.className || ''} ${classes.clear}`
  }

  if (primary) {
    props.className = `${props.className || ''} ${classes.primary}`
  }

  if (danger) {
    props.className = `${props.className || ''} ${classes.danger}`
  }

  if (success) {
    props.className = `${props.className || ''} ${classes.success}`
  }

  if (secondary) {
    props.className = `${props.className || ''} ${classes.secondary}`
  }

  props.className = `h-8 flex items-center text-13px font-medium px-3 ${
    props.className || ''
  }`

  return (
    <button {...props}>
      {loading ? (
        <Pulse dotClassName="bg-white" height="10px" dotHeight="100%" />
      ) : (
        children
      )}
    </button>
  )
}

export default Button

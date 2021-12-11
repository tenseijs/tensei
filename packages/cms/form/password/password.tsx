import React from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiFieldPassword } from '@tensei/eui/lib/components/form'

const FormPassword: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  value,
  onChange,
  onFocus,
  error
}) => {
  return (
    <EuiFieldPassword
      id={id}
      fullWidth
      name={name}
      type="dual"
      value={value}
      onFocus={onFocus}
      isInvalid={!!error}
      placeholder={field.name}
      onChange={event => onChange(event.target.value)}
      {...field.attributes}
    />
  )
}

export default FormPassword

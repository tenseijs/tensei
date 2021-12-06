import React from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiFieldText } from '@tensei/eui/lib/components/form'

const FormText: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  value,
  onChange,
  onFocus,
  error
}) => {
  return (
    <EuiFieldText
      id={id}
      name={name}
      fullWidth
      value={value}
      onFocus={onFocus}
      isInvalid={!!error}
      onChange={event => onChange(event.target.value)}
      placeholder={field.name}
      {...field.attributes}
    />
  )
}

export default FormText

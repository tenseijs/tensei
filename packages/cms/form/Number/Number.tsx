import React from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiFieldNumber } from '@tensei/eui/lib/components/form'

const FormNumber: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  form,
  onChange,
  error
}) => {
  return (
    <EuiFieldNumber
      id={id}
      name={name}
      fullWidth
      value={form[field.inputName]}
      isInvalid={!!error}
      onChange={event => onChange(event.target.value)}
      placeholder={field.name}
      {...field.attributes}
    />
  )
}

export default FormNumber

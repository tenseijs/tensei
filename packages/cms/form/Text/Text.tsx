import React from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiFieldText } from '@tensei/eui/lib/components/form'

const FormText: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  form,
  onChange,
  error
}) => {
  return (
    <EuiFieldText
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

export default FormText

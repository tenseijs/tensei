import React from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiTextArea } from '@tensei/eui/lib/components/form'

const FormTextarea: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  form,
  onChange,
  onFocus,
  error
}) => {
  return (
    <EuiTextArea
      id={id}
      name={name}
      fullWidth
      onFocus={onFocus}
      value={form[field.inputName]}
      isInvalid={!!error}
      onChange={event => onChange(event.target.value)}
      placeholder={field.name}
      {...field.attributes}
    />
  )
}

export default FormTextarea

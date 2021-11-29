import React from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiFieldText, EuiFormRow } from '@tensei/eui/lib/components/form'

const FormText: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  value,
  onChange,
  error
}) => {
  return (
    <EuiFormRow label={field.name} error={error} isInvalid={!!error}>
      <EuiFieldText
        id={id}
        name={name}
        fullWidth
        value={value}
        isInvalid={!!error}
        onChange={event => onChange(event.target.value)}
        placeholder={field.name}
        {...field.attributes}
      />
    </EuiFormRow>
  )
}

export default FormText

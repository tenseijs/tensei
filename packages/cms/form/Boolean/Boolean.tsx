import React from 'react'
import { Checkbox, FormComponentProps } from '@tensei/components'

const FormBoolean: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  value,
  onChange,
  error
}) => (
  <Checkbox
    name={name}
    id={id}
    checked={value as boolean}
    label={field.name}
    error={error}
    {...field.attributes}
    onChange={event => onChange(event.target.checked)}
  />
)

export default FormBoolean

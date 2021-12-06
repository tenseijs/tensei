import React from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiSelect } from '@tensei/eui/lib/components/form'

const FormSelect: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  value,
  onChange,
  onFocus,
  error
}) => {
  const options = field?.selectOptions?.map(option => {
    return { text: option.label, value: option.value }
  })

  return (
    <EuiSelect
      id={id}
      options={options}
      name={name}
      fullWidth
      value={value}
      onFocus={onFocus}
      isInvalid={!!error}
      placeholder={field.name}
      onChange={event => onChange(event.target.value)}
      {...field.attributes}
      aria-label={field.name}
    />
  )
}

export default FormSelect

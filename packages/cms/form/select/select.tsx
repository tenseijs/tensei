import React, { useState } from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiSuperSelect } from '@tensei/eui/lib/components/form'

const FormSelect: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  onFocus,
  error
}) => {
  const options =
    field?.selectOptions?.map(option => {
      return { value: option.label, inputDisplay: option.value }
    }) || []
  const [value, setValue] = useState(options[1].value)

  const onChange = (value: string) => {
    setValue(value)
  }

  return (
    <EuiSuperSelect
      id={id}
      options={options}
      name={name}
      fullWidth
      valueOfSelected={value}
      onFocus={onFocus}
      isInvalid={!!error}
      placeholder={field.name}
      onChange={value => onChange(value)}
      {...field.attributes}
      aria-label={field.name}
    />
  )
}

export default FormSelect

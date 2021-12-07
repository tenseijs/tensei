import React, { useState } from 'react'
import { FormComponentProps } from '@tensei/components'
import { EuiSuperSelect } from '@tensei/eui/lib/components/form'

const FormSelect: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  value,
  onChange,
  onFocus,
  error
}) => {
  const options =
    field?.selectOptions?.map(option => {
      return { value: option.value, inputDisplay: option.label }
    }) || []

  return (
    <EuiSuperSelect
      id={id}
      options={options}
      name={name}
      fullWidth
      valueOfSelected={value || options[2].value}
      onFocus={onFocus}
      isInvalid={!!error}
      placeholder={field.name}
      onChange={value => {
        onChange(value)
      }}
      {...field.attributes}
      aria-label={field.name}
    />
  )
}

export default FormSelect

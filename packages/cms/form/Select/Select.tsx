import React from 'react'
import { Select, FormComponentProps } from '@tensei/components'

const FormSelect: React.FC<FormComponentProps> = ({
    field,
    name,
    id,
    value,
    onChange,
    error
}) => (
    <Select
        name={name}
        id={id}
        value={value as string}
        label={field.name}
        error={error}
        placeholder={field.name}
        {...field.attributes}
        options={field.selectOptions}
        onChange={event => onChange(event.target.value)}
    />
)

export default FormSelect

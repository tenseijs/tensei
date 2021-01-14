import React from 'react'
import { TextInput, FormComponentProps } from '@tensei/components'

const Text: React.FC<FormComponentProps> = ({
    field,
    name,
    id,
    value,
    onChange,
    error
}) => (
    <TextInput
        name={name}
        id={id}
        value={value as string}
        label={field.name}
        error={error}
        placeholder={field.name}
        {...field.attributes}
        onChange={event => onChange(event.target.value)}
    />
)

export default Text

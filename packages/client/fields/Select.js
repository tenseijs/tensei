import React from 'react'
import { SelectField, Option } from '@contentful/forma-36-react-components'

class Select extends React.Component {
    render() {
        const { value, onFieldChange, field, errorMessage } = this.props

        return (
            <SelectField
                value={value}
                id={field.inputName}
                name={field.inputName}
                labelText={field.name}
                validationMessage={errorMessage}
                description={field.description}
                onChange={event => onFieldChange(event.target.value)}
            >
                {(field.selectOptions || []).map(option => (
                    <Option key={option.value} value={option.value}>
                        {option.label}
                    </Option>
                ))}
            </SelectField>
        )
    }
}

export default Select

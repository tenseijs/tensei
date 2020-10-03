import React from 'react'
import {
    Checkbox,
    ValidationMessage
} from '@contentful/forma-36-react-components'

class BooleanField extends React.Component {
    render() {
        const { value, onFieldChange, field, errorMessage } = this.props

        let checked = false

        if ([1, true, 'true'].includes(value)) {
            checked = true
        }

        return (
            <div className="TextField">
                <div className="TextField__label-wrapper">
                    <label className="FormLabel" htmlFor={field.inputName}>
                        {field.name}
                    </label>
                </div>
                <Checkbox
                    checked={checked}
                    onChange={event => onFieldChange(event.target.checked)}
                    labelText={field.name}
                    id={field.inputName}
                />
                {errorMessage ? (
                    <ValidationMessage className="TextFieldValidationMessage">
                        {errorMessage}
                    </ValidationMessage>
                ) : null}
            </div>
        )
    }
}

export default BooleanField

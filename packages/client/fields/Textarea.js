import React from 'react'
import {
    Textarea as BaseTextarea,
    ValidationMessage
} from '@contentful/forma-36-react-components'

class Textarea extends React.Component {
    render() {
        const {
            value,
            onFieldChange,
            field,
            errorMessage,
            ...rest
        } = this.props

        return (
            <div className="TextField">
                <div className="TextField__label-wrapper">
                    <label className="FormLabel" htmlFor={field.inputName}>
                        {field.name}
                    </label>
                </div>
                <BaseTextarea
                    {...rest}
                    value={value.toString()}
                    id={field.inputName}
                    name={field.inputName}
                    name={field.inputName}
                    error={!!errorMessage}
                    description={field.description}
                    onChange={event => onFieldChange(event.target.value)}
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

export default Textarea

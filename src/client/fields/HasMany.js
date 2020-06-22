import React from 'react'
import { TagPicker } from 'office-ui-fabric-react/lib/Pickers'

class HasMany extends React.Component {
    render() {
        const {
            value,
            onFieldChange,
            field,
            errorMessage,
            ...rest
        } = this.props

        return (
            <TagPicker
                {...rest}
                value={value}
                name={field.inputName}
                errorMessage={errorMessage}
                description={field.description}
                onChange={(event) => onFieldChange(event.target.value)}
            />
        )
    }
}

export default HasMany

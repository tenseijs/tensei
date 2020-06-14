import React from 'react'
import { TextField } from 'office-ui-fabric-react/lib/TextField'

class Text extends React.Component {
    render() {
        const { value, onFieldChange, field, ...rest } = this.props

        return (
            <TextField
                {...rest}
                value={value}
                name={field.inputName}
                description={field.description}
                onChange={(event) => onFieldChange(event.target.value)}
            />
        )
    }
}

export default Text

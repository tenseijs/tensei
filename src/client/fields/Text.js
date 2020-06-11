import React from 'react'
import { TextField } from 'office-ui-fabric-react/lib/TextField'

class Text extends React.Component {
    render() {
        const { value, onChange, field, ...rest } = this.props

        return (
            <TextField
                {...rest}
                value={value}
                onChange={onChange}
                name={field.inputName}
                description={field.description}
            />
        )
    }
}

export default Text

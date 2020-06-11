import React from 'react'
import { DatePicker } from 'office-ui-fabric-react/lib/DatePicker'

class DateField extends React.Component {
    render() {
        const { value, onChange, field, ...rest } = this.props

        return (
            <DatePicker
                {...rest}
                onChange={onChange}
                name={field.inputName}
                value={new Date(value)}
                description={field.description}
            />
        )
    }
}

export default DateField

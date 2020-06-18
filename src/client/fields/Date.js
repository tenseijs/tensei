import React from 'react'
import format from 'date-fns/format'
import { DatePicker } from 'office-ui-fabric-react/lib/DatePicker'

class DateField extends React.Component {
    render() {
        const { value, onFieldChange, field, ...rest } = this.props
        return (
            <DatePicker
                {...rest}
                name={field.inputName}
                value={new Date(value)}
                description={field.description}
                firstDayOfWeek={field.firstDayOfWeek}
                onSelectDate={(date) =>
                    onFieldChange(format(date, field.format))
                }
            />
        )
    }
}

export default DateField

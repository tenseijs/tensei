import React from 'react'
import format from 'date-fns/format'

class DateIndexField extends React.Component {
    render() {
        const { value, field, ...rest } = this.props

        if (!value) {
            return null
        }

        return format(new Date(value), field.format)
    }
}

export default DateIndexField

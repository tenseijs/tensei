import React from 'react'
import format from 'date-fns/format'
import Flatpickr from 'react-flatpickr'

class DateTimeField extends React.Component {
    render() {
        const { value, onFieldChange, field, ...rest } = this.props

        return (
            <div className="TextField TextField--full">
                <div className="TextField__label-wrapper">
                    <label className="FormLabel" htmlFor={field.inputName}>
                        {field.name}
                    </label>
                </div>
                <Flatpickr
                    options={{
                        enableTime: field.component === 'DateTimeField',
                    }}
                    className='TextInput__input'
                    onChange={([date]) => onFieldChange(date)}
                    value={new Date()}
                ></Flatpickr>
            </div>
        )
    }
}

export default DateTimeField

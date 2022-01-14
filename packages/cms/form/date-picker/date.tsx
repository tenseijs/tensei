import { EuiDatePicker } from '@tensei/eui/lib/components/date_picker'
import { EuiFormRow } from '@tensei/eui/lib/components/form'
<<<<<<< HEAD
import React from 'react'
=======
import React, { useEffect } from 'react'
>>>>>>> ffe5d660f34ba5af4818efb6bd8e243b104ad683

import moment from 'moment'
import { FormComponentProps } from '@tensei/components'

const FormDatePicker: React.FC<FormComponentProps> = ({
  field,
  value,
  error,
  onChange
}) => {
  const handleChange = (date: moment.Moment) => {
    onChange(date.format(field.format))
  }
<<<<<<< HEAD
  const isDateField = field.fieldName === 'DateField' ? true : false
=======

  const isTimeStamp = field.fieldName === 'Timestamp' ? true : false

>>>>>>> ffe5d660f34ba5af4818efb6bd8e243b104ad683
  return (
    <EuiFormRow fullWidth isInvalid>
      <EuiDatePicker
        inputRef={c => c} // requires inputRef so i just inserted a function that does nothing
<<<<<<< HEAD
        showTimeSelect={!isDateField}
        selected={moment(value)}
=======
        dateFormat={isTimeStamp ? 'hh:mm a' : 'do MMM yyyy'}
        showTimeSelectOnly={isTimeStamp}
        selected={moment.utc(value)}
>>>>>>> ffe5d660f34ba5af4818efb6bd8e243b104ad683
        onChange={handleChange}
        fullWidth
        isInvalid={!!error}
        {...field.attributes}
<<<<<<< HEAD
=======
        iconType={isTimeStamp ? 'clock' : 'calendar'}
>>>>>>> ffe5d660f34ba5af4818efb6bd8e243b104ad683
      />
    </EuiFormRow>
  )
}

export default FormDatePicker

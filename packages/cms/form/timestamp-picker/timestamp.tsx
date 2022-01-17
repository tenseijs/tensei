import { EuiDatePicker } from '@tensei/eui/lib/components/date_picker'
import { EuiFormRow } from '@tensei/eui/lib/components/form'
import React from 'react'

import moment from 'moment'
import { FormComponentProps } from '@tensei/components'

const FormTimestampPicker: React.FC<FormComponentProps> = ({
  field,
  value,
  error,
  onChange
}) => {
  const handleChange = (date: moment.Moment) => {
    onChange(date.format(field.format))
  }

  return (
    <EuiFormRow fullWidth isInvalid>
      <EuiDatePicker
        inputRef={c => c} // requires inputRef so i just inserted a function that does nothing
        showTimeSelect
        selected={moment.utc(value)}
        onChange={handleChange}
        fullWidth
        isInvalid={!!error}
        {...field.attributes}
      />
    </EuiFormRow>
  )
}

export default FormTimestampPicker

import { EuiDatePicker } from '@tensei/eui/lib/components/date_picker'
import { EuiFormRow } from '@tensei/eui/lib/components/form'
import React, { useState } from 'react'

import moment from 'moment'
import { FormComponentProps } from '@tensei/components'
import { useRef } from 'react'

const FormDatePicker: React.FC<FormComponentProps> = ({
  field,
  value,
  onChange
}) => {
  const [startDate, setStartDate] = useState(moment.utc(value))

  const handleChange = (date: moment.Moment) => {
    setStartDate(date)
    onChange(date.format())
  }

  return (
    <EuiFormRow fullWidth>
      <EuiDatePicker
        selected={startDate}
        onChange={handleChange}
        fullWidth
        {...field.attributes}
      />
    </EuiFormRow>
  )
}

export default FormDatePicker

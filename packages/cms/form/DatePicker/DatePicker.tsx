import React from 'react'
import Dayjs from 'dayjs'
import { DatePicker, FormComponentProps } from '@tensei/components'

const FormDate: React.FC<FormComponentProps> = ({
  field,
  name,
  id,
  value,
  onChange,
  error
}) => {
  return (
    <DatePicker
      name={name}
      error={error}
      enableTime={field.timePicker}
      time_24hr={field.timePicker24Hr}
      id={id}
      label={field.name}
      value={value}
      onChange={dates => {
        if (dates && onChange && dates[0]) {
          onChange(Dayjs(dates[0]).format(field.format))
        }
      }}
    />
  )
}

export default FormDate

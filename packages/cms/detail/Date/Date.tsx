import React from 'react'
import { DateTime } from 'luxon'
import { DetailComponentProps, Paragraph } from '@tensei/components'

export interface DateProps extends DetailComponentProps {
    className?: string
}

// @ts-ignore
window.DateTime = DateTime

const DateDetail: React.FC<DateProps> = ({ value, className, field }) => (
    <Paragraph className={className}>
        {DateTime.fromJSDate(new Date(value as string)).toFormat(field.format)}
    </Paragraph>
)

export default DateDetail

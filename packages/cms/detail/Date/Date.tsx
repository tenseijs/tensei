import React from 'react'
import Dayjs from 'dayjs'
import { DetailComponentProps, Paragraph } from '@tensei/components'

export interface DateProps extends DetailComponentProps {
    className?: string
}

const DateDetail: React.FC<DateProps> = ({ value, className, field }) => (
    <Paragraph className={className}>
        {Dayjs(value as string).format(field.format)}
    </Paragraph>
)

export default DateDetail

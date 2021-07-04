import React, { EventHandler, SyntheticEvent } from 'react'
import { DetailComponentProps, Paragraph } from '@tensei/components'

export interface TextProps extends DetailComponentProps {
  className?: string
  truncate?: boolean
  onClick?: EventHandler<SyntheticEvent<HTMLParagraphElement>>
}

const Text: React.FC<TextProps> = ({
  value,
  className,
  field,
  truncate = false,
  onClick
}) => {
  const textIsTruncated = (value || '').toString().length > field.truncate

  return (
    <Paragraph onClick={onClick} className={className}>
      {truncate ? value?.toString().slice(0, field.truncate) : value}
      {textIsTruncated && truncate ? <b>...</b> : ''}
    </Paragraph>
  )
}

export default Text

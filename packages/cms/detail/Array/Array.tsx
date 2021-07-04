import React, { EventHandler, SyntheticEvent } from 'react'
import { DetailComponentProps } from '@tensei/components'

const Array: React.FC<
  DetailComponentProps & {
    className?: string
    onClick?: EventHandler<SyntheticEvent<HTMLParagraphElement>>
  }
> = ({ value }) => {
  if (!value) {
    return null
  }

  return (
    <ul className="list-disc">
      {value.map((item: string | number, itemIndex: number) => (
        <li className="mt-1" key={itemIndex}>
          {item}
        </li>
      ))}
    </ul>
  )
}

export default Array

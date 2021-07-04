import React, { EventHandler, SyntheticEvent } from 'react'
import { DetailComponentProps } from '@tensei/components'

import Text from '../Text'

const ID: React.FC<
  DetailComponentProps & {
    className?: string
    onClick?: EventHandler<SyntheticEvent<HTMLParagraphElement>>
  }
> = ({ value, values, field, resource, className = '' }) => {
  return (
    <>
      <Text
        value={value}
        field={field}
        values={values}
        resource={resource}
        className={`${className} bg-opacity-10 bg-tensei-primary text-base rounded-md px-2 text-tensei-primary border border-tensei-primary w-auto inline-block`}
      ></Text>
    </>
  )
}

export default ID

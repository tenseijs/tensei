import React from 'react'
import { IndexComponentProps } from '@tensei/components'
import { EuiBadge } from '@tensei/eui/lib/components/badge'

const IndexId: React.FC<IndexComponentProps> = ({
  value,
  field,
  values,
  resource
}) => {
  return <EuiBadge color={'default'} children={value} />
}

export default IndexId

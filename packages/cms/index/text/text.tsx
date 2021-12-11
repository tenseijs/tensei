import React from 'react'
import { IndexComponentProps } from '@tensei/components'
import { EuiText } from '@tensei/eui/lib/components/text'

const IndexText: React.FC<IndexComponentProps> = ({
  value,
  field,
  values,
  resource
}) => {
  return <EuiText size="s">{value || '-'}</EuiText>
}

export default IndexText

import React from 'react'
import { EuiHealth } from '@tensei/eui/lib/components/health'
import { EuiText } from '@tensei/eui/lib/components/text'
import { IndexComponentProps } from '@tensei/components'
import { EuiBadge } from '@tensei/eui/lib/components/badge'

const IndexBoolean: React.FC<IndexComponentProps> = ({
  value,
  field,
  values,
  resource
}) => {
  const color = value ? 'success' : 'danger'

  const text = value ? field.trueLabel : field.falseLabel

  return (
    <EuiHealth color={color} textSize="s">
      {text}
    </EuiHealth>
  )
}

export default IndexBoolean

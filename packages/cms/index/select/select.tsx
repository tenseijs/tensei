import React from 'react'
import { IndexComponentProps } from '@tensei/components'
import { EuiText } from '@tensei/eui/lib/components/text'

export const IndexSelect: React.FC<IndexComponentProps> = ({
  value,
  field,
  values,
  resource
}) => {
  const selectOption = field.selectOptions?.find(
    option => option.value === value
  )

  return <EuiText size="s">{selectOption?.label || '-'}</EuiText>
}

export default IndexSelect

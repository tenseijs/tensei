import React from 'react'
import { IndexComponentProps } from '@tensei/components'
import { EuiI18nNumber } from '@tensei/eui/lib/components/i18n/i18n_number'

const IndexNumber: React.FC<IndexComponentProps> = ({
  value,
  field,
  values,
  resource
}) => {
  return <EuiI18nNumber value={value} />
}

export default IndexNumber

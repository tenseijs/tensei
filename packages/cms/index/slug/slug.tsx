import React from 'react'
import { IndexComponentProps } from '@tensei/components'
import { EuiBadge } from '@tensei/eui/lib/components/badge'

const IndexSlug: React.FC<IndexComponentProps> = ({ value }) => (
  <EuiBadge color={'default'}>{value}</EuiBadge>
)

export default IndexSlug

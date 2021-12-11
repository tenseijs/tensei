import React from 'react'
import styled from 'styled-components'
import { IndexComponentProps } from '@tensei/components'
import { EuiCopy } from '@tensei/eui/lib/components/copy'
import { EuiBadge } from '@tensei/eui/lib/components/badge'

const BadgeInButton = styled(EuiBadge)`
  cursor: pointer;

  .euiBadge__content,
  .euiBadge__text {
    cursor: pointer;
  }
`
const IndexId: React.FC<IndexComponentProps> = ({ value }) => {
  return (
    <EuiCopy textToCopy={value}>
      {copy => (
        <button onClick={copy}>
          <BadgeInButton color={'hollow'}>{value}</BadgeInButton>
        </button>
      )}
    </EuiCopy>
  )
}

export default IndexId

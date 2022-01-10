import React from 'react'
import styled from 'styled-components'

import { CommunityPanel } from './community-panel'

const Content = styled.div`
  width: 70%;
`

export const Dashboard: React.FunctionComponent = () => {
  return (
    <>
      <Content />
      <CommunityPanel />
    </>
  )
}

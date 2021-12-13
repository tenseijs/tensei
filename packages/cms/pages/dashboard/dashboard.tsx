import React from 'react'
import styled from 'styled-components'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { DashboardLayout } from '../components/dashboard/layout'
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

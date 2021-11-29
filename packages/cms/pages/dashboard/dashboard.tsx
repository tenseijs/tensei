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
    <DashboardLayout>
      <DashboardLayout.Sidebar title="Dashboard" hideNestedSidebar />
      <DashboardLayout.Body>
        <DashboardLayout.Topbar>
          <EuiTitle size="xs">
            <h3>Dashboard</h3>
          </EuiTitle>
        </DashboardLayout.Topbar>

        <DashboardLayout.Content>
          <Content />
          <CommunityPanel />
        </DashboardLayout.Content>
      </DashboardLayout.Body>
    </DashboardLayout>
  )
}

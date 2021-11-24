import React from 'react'
import styled from 'styled-components'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { DashboardLayout } from '../components/dashboard/layout'

const HeaderContainer = styled.div`
  display: flex;
`

export const Dashboard: React.FunctionComponent = () => {
  return (
    <DashboardLayout>
      <DashboardLayout.Sidebar title="Dashboard" />
      <DashboardLayout.Body>
        <DashboardLayout.Topbar>
          <EuiTitle size="xs">
            <h3>Dashboard</h3>
          </EuiTitle>
        </DashboardLayout.Topbar>
      </DashboardLayout.Body>
    </DashboardLayout>
  )
}

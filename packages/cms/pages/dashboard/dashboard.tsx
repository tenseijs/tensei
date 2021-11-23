import React from 'react'
import styled from 'styled-components'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import {
  DashboardLayout,
  DashboardLayoutComponents
} from '../components/dashboard/layout'

const HeaderContainer = styled.div`
  display: flex;
`

export const Dashboard: React.FunctionComponent = () => {
  return (
    <DashboardLayout>
      <DashboardLayoutComponents.Sidebar title="Dashboard" />
      <DashboardLayoutComponents.Body>
        <DashboardLayoutComponents.Topbar>
          <EuiTitle size="xs">
            <h3>Dashboard</h3>
          </EuiTitle>
        </DashboardLayoutComponents.Topbar>
      </DashboardLayoutComponents.Body>
    </DashboardLayout>
  )
}

import React from 'react'
import styled from 'styled-components'
import { DashboardLayout } from '../components/dashboard/layout'
import { SidebarMenu } from '../components/dashboard/layout/sidebar'
import { TopbarMenu } from '../components/dashboard/layout/topbar'
import { EuiTitle } from '@tensei/eui/lib/components/title'

const HeaderContainer = styled.div`
  display: flex;
`

export const Dashboard: React.FunctionComponent = () => {
  return (
    <DashboardLayout
      topbar={
        <TopbarMenu>
          <EuiTitle size="xs">
            <h3>Dashboard</h3>
          </EuiTitle>
        </TopbarMenu>
      }
      sidebar={<SidebarMenu title="Dashboard" />}
    ></DashboardLayout>
  )
}

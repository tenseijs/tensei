import React from 'react'
import styled from 'styled-components'
import { DashboardLayout } from '../components/dashboard/layout'

const HeaderContainer = styled.div`
  display: flex;
`

export const Dashboard: React.FunctionComponent = () => {
  return <DashboardLayout></DashboardLayout>
}

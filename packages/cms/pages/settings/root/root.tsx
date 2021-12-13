import React from 'react'
import { Route, useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { EuiTabs, EuiTab } from '@tensei/eui/lib/components/tabs'

import { Profile } from '../profile'
import { TeamMembers } from '../team-members'

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const TabsWrapper = styled.div`
  padding: 20px 40px 0 40px;
`

const tabs = [
  {
    path: 'profile',
    component: Profile,
    title: 'Profile'
  },
  {
    path: 'team-members',
    component: TeamMembers,
    title: 'Team members'
  },
  {
    path: 'roles-and-permissions',
    component: () => <h1>Replace with the roles and permissions page</h1>,
    title: 'Roles & Permissions'
  }
]

export const Root: React.FunctionComponent = ({ children }) => {
  const { push } = useHistory()
  const { pathname } = useLocation()

  const isActive = (path: string) => pathname.includes(path)

  return (
    <StyledLayout>
      <TabsWrapper>
        <EuiTabs>
          {tabs.map(tab => (
            <EuiTab
              isSelected={isActive(tab.path)}
              onClick={() =>
                push(window.Tensei.getPath(`settings/${tab.path}`))
              }
            >
              {tab.title}
            </EuiTab>
          ))}
        </EuiTabs>
      </TabsWrapper>
      {tabs.map(tab => (
        <Route
          component={tab.component}
          path={window.Tensei.getPath(`settings/${tab.path}`)}
        />
      ))}
    </StyledLayout>
  )
}

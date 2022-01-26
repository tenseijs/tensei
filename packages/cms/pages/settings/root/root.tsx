import React, { useEffect } from 'react'
import { Route, useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { EuiTabs, EuiTab } from '@tensei/eui/lib/components/tabs'

import { Profile } from '../profile'
import { TeamMembers } from '../team-members'
import RolesAndPermissions from '../roles-and-permissions'
import { useAuthStore } from '../../../store/auth'
import { TOAST_FADE_OUT_MS } from '@tensei/eui/lib/components/toast/global_toast_list'
import { useToastStore } from '../../../store/toast'

const StyledLayout = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const TabsWrapper = styled.div`
  padding: 20px 40px 0 40px;

  @media screen and (max-width: 420px) {
    padding 20px 20px 0 20px;
    .euiTab + .euiTab {
      margin-left: 10px;
    }
  }
`

const tabs = [
  {
    path: 'profile',
    component: Profile,
    title: 'Profile',
    permissions: []
  },
  {
    path: 'team-members',
    component: TeamMembers,
    title: 'Team members',
    permissions: [
      'index:admin-users',
      'invite:admin-users',
      'update:admin-users',
      'delete:admin-users'
    ]
  },
  {
    path: 'roles-and-permissions',
    component: RolesAndPermissions,
    title: 'Roles & Permissions',
    permissions: [
      'index:admin-roles',
      'create:admin-roles',
      'update:admin-roles',
      'delete:admin-roles'
    ]
  }
]

export const Root: React.FunctionComponent = ({ children }) => {
  const { push, replace } = useHistory()
  const { pathname } = useLocation()
  const isActive = (path: string) => pathname.includes(path)
  const { hasPermission } = useAuthStore()
  const { toast } = useToastStore()

  const hasAnyPermission = (tab: any) => {
    return tab?.permissions.length > 0
      ? tab.permissions.some((permission: any) => hasPermission(permission))
      : true
  }

  useEffect(() => {
    const tab = tabs.find(tab => isActive(tab.path))
    if (!hasAnyPermission(tab)) {
      replace(window.Tensei.getPath(`settings/profile`))
      toast(
        'Unauthorized',
        <p>You're not authorized to access {tab?.title}</p>,
        'danger'
      )

      return
    }
  }, [])

  return (
    <StyledLayout>
      <TabsWrapper>
        <EuiTabs>
          {tabs.map(tab => {
            if (!hasAnyPermission(tab)) return null

            return (
              <EuiTab
                key={tab.path}
                isSelected={isActive(tab.path)}
                onClick={() =>
                  push(window.Tensei.getPath(`settings/${tab.path}`))
                }
              >
                {tab.title}
              </EuiTab>
            )
          })}
        </EuiTabs>
      </TabsWrapper>
      {tabs.map(tab => (
        <Route
          key={tab.path}
          component={tab.component}
          path={window.Tensei.getPath(`settings/${tab.path}`)}
        />
      ))}
    </StyledLayout>
  )
}

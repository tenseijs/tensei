import { Route, Redirect } from 'react-router-dom'
import React, { createContext, useState, useEffect } from 'react'

import {
  TenseiCtxInterface,
  Pulse,
  CmsRoute,
  PageWrapper
} from '@tensei/components'

import Register from '../Register'
import Dashboard from '../Dashboard'
import Users from '../Settings/Users'
import Roles from '../Settings/Roles'

const TenseiCtx = createContext<TenseiCtxInterface>({
  user: null as any,
  booted: false,
  setUser: () => {},
  setBooted: () => {},
  routes: [],
  setRoutes: () => {}
})

export const MustBeAuthComponent = (Component: React.FC<any>) => {
  const Comp = (props: any) => {
    return (
      <TenseiCtx.Consumer>
        {({ user }) =>
          user ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={
                window.Tensei.state.registered
                  ? window.Tensei.getPath('auth/login')
                  : window.Tensei.getPath('auth/register')
              }
            />
          )
        }
      </TenseiCtx.Consumer>
    )
  }

  return Comp
}

export const MustBeNotAuthComponent = (Component: React.FC<any>) => {
  const Comp = (props: any) => {
    return (
      <TenseiCtx.Consumer>
        {({ user }) =>
          !user ? (
            <Component {...props} />
          ) : (
            <Redirect to={window.Tensei.getPath('')} />
          )
        }
      </TenseiCtx.Consumer>
    )
  }

  return Comp
}

const Wrapper: React.FC = () => {
  const authPluginConfig = window.Tensei.state.config.pluginsConfig['auth']

  const rolesAndPermissionsEnabled = authPluginConfig.rolesAndPermissions

  const [routes, setRoutes] = useState<CmsRoute[]>([
    {
      path: window.Tensei.getPath(`settings/users`),
      requiredPermissions: ['index:admin-users'],
      component: Users,
      settings: true,
      group: 'Administration Panel',
      name: 'Users',
      exact: true
    },
    {
      path: window.Tensei.getPath(`settings/roles`),
      requiredPermissions: ['index:admin-roles'],
      component: Roles,
      settings: true,
      group: 'Administration Panel',
      name: 'Roles'
    },
    ...(rolesAndPermissionsEnabled
      ? [
          {
            path: window.Tensei.getPath(`auth/roles`),
            requiredPermissions: [`index:${authPluginConfig.role.slug}`],
            component: () => (
              <PageWrapper>
                <Roles resource={authPluginConfig.role} />
              </PageWrapper>
            ),
            settings: false,
            icon: 'membership-mgt',
            group: 'Users & Permissions',
            name: authPluginConfig.role.label
          }
        ]
      : [])
  ])
  const [booted, setBooted] = useState(false)
  const [user, setUser] = useState<TenseiCtxInterface['user']>(null as any)

  const value = {
    user,
    setUser,
    booted,
    setBooted,
    routes,
    setRoutes
  }

  window.Tensei.ctx = value

  useEffect(() => {
    window.Tensei.client.get('csrf')
  }, [])

  return (
    <TenseiCtx.Provider value={value}>
      {booted ? (
        <>
          <Route
            exact
            component={MustBeNotAuthComponent(Register)}
            path={window.Tensei.getPath('auth/register')}
          />
          <Route
            exact
            component={MustBeNotAuthComponent(Register)}
            path={window.Tensei.getPath('auth/login')}
          />
          <Route
            path={window.Tensei.getPath('')}
            component={MustBeAuthComponent(Dashboard)}
          />
        </>
      ) : (
        <div className="flex justify-center my-10">
          <Pulse dotClassName="bg-tensei-primary" />
        </div>
      )}
    </TenseiCtx.Provider>
  )
}

export default Wrapper

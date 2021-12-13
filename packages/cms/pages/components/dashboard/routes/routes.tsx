import { DashboardLayout } from '../layout/layout'
import React, { Fragment } from 'react'
import { Route } from 'react-router-dom'

import { EuiTitle } from '@tensei/eui/lib/components/title'

import { AssetManager } from '../../../assests/asset-manager'
import { Dashboard } from '../../../dashboard'
import { ResourceFormWrapper, ResourceView } from '../../../resources'
import { MustBeAuthComponent } from '../../auth/guards/must-be-authenticated'
import { Root } from '../../../settings/root'

const routesConfig = [
  {
    path: 'resources/:resource',
    customTopbar: true,
    component: ResourceView
  },
  {
    path: 'resources/:resource/create',
    customTopbar: true,
    component: ResourceFormWrapper
  },
  {
    path: 'resources/:resource/:id/edit',
    customTopbar: true,
    component: ResourceFormWrapper
  },
  {
    path: 'assets',
    customTopbar: true,
    component: AssetManager
  },
  {
    path: '',
    customTopbar: false,
    component: Dashboard
  },
  {
    path: 'settings',
    customTopbar: false,
    component: Root,
    title: 'Settings',
    exact: false
  }
]

export const DashboardRoutes: React.FunctionComponent = () => {
  return (
    <DashboardLayout>
      <DashboardLayout.Sidebar title="Dashboard" />
      <DashboardLayout.Body>
        {routesConfig.map(config => {
          let Component = MustBeAuthComponent(config.component)

          if (!config.customTopbar) {
            const RouteComponent = config.component

            Component = MustBeAuthComponent((...props: any) => (
              <Fragment key={config.path}>
                <DashboardLayout.Topbar>
                  <EuiTitle size="xs">
                    <h3>{config?.title}</h3>
                  </EuiTitle>
                </DashboardLayout.Topbar>
                <DashboardLayout.Content>
                  <RouteComponent {...props} />
                </DashboardLayout.Content>
              </Fragment>
            ))
          }

          return (
            <Route
              key={config.path}
              component={Component}
              path={window.Tensei.getPath(config.path)}
              exact={config?.exact === undefined ? true : config?.exact}
            />
          )
        })}
      </DashboardLayout.Body>
    </DashboardLayout>
  )
}

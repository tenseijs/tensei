import React from 'react'
import { Route } from 'react-router-dom'

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
    <>
      {routesConfig.map(config => {
        let Component = MustBeAuthComponent(config.component)
          return (
            <Route 
              key={config.path}
              component={Component}
              path={window.Tensei.getPath(config.path)}
              exact={config?.exact === undefined ? true : config?.exact}
            />
          )
      })}
    </>
  )
}
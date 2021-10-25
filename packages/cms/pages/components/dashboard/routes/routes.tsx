import React from 'react'
import { Route } from 'react-router-dom'

import { Home } from '../../../home'
import { Resource } from '../../../resources/resource'

export const DashboardRoutes: React.FunctionComponent = () => {
  return (
    <>
      <Route
        component={Resource}
        path={window.Tensei.getPath('resources/:resource')}
      />
      <Route exact component={Home} path={window.Tensei.getPath('')} />
    </>
  )
}

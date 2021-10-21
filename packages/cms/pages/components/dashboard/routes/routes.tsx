import React from 'react'
import { Route } from 'react-router-dom'

import { Home } from '@pages/home'
import { Resource } from '@pages/resources/resource'

export const DashboardRoutes: React.FunctionComponent = () => {
  return (
    <>
      <Route
        component={Resource}
        path={window.Tensei.getPath('resources/:resource')}
      />
      <Route component={Home} path={window.Tensei.getPath('')} />
    </>
  )
}

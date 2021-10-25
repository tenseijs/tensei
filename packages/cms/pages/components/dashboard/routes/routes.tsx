import React from 'react'
import { Route } from 'react-router-dom'

import { Dashboard } from '../../../dashboard'
import { Resource } from '../../../resources/resource'

export const DashboardRoutes: React.FunctionComponent = () => {
  return (
    <>
      <Route
        exact
        component={Resource}
        path={window.Tensei.getPath('resources/:resource')}
      />
      <Route exact component={Dashboard} path={window.Tensei.getPath('')} />
    </>
  )
}

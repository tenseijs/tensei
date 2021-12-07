import React from 'react'
import { Route } from 'react-router-dom'

import { Dashboard } from '../../../dashboard'
import { Resource, CreateResource, EditResource } from '../../../resources'
import { MustBeAuthComponent } from '../../auth/guards/must-be-authenticated'

export const DashboardRoutes: React.FunctionComponent = () => {
  return (
    <>
      <Route
        exact
        component={MustBeAuthComponent(Resource)}
        path={window.Tensei.getPath('resources/:resource')}
      />
      <Route
        exact
        component={MustBeAuthComponent(CreateResource)}
        path={window.Tensei.getPath('resources/:resource/create')}
      />
      <Route
        exact
        component={MustBeAuthComponent(EditResource)}
        path={window.Tensei.getPath('resources/:resource/:id/edit')}
      />
      <Route
        exact
        component={MustBeAuthComponent(Dashboard)}
        path={window.Tensei.getPath('')}
      />
    </>
  )
}

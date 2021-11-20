import React from 'react'
import { Route } from 'react-router-dom'

import { Profile } from '../../../settings/profile'
import { MustBeAuthComponent } from '../../auth/guards/must-be-authenticated'

export const SettingsRoutes: React.FunctionComponent = () => {
  return (
    <>
      <Route
        exact
        component={MustBeAuthComponent(Profile)}
        path={window.Tensei.getPath('settings/profile')}
      />
    </>
  )
}

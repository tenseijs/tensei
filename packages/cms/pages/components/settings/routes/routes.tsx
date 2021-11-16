import React from 'react'
import { Route } from 'react-router-dom'

import { Profile } from '../../../settings/profile'

export const SettingsRoutes: React.FunctionComponent = () => {
  return (
    <>
      <Route
        exact
        component={Profile}
        path={window.Tensei.getPath('settings/profile')}
      />
    </>
  )
}

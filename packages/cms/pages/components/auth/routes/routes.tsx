import React from 'react'
import { Route } from 'react-router-dom'

import { Login } from '../../../auth/login'
import { Register } from '../../../auth/register'
import { MustNotBeAuthComponent } from '../guards/must-not-be-authenticated'

export const AuthRoutes: React.FunctionComponent = () => {
  return (
    <>
      <Route
        component={MustNotBeAuthComponent(Login)}
        path={window.Tensei.getPath('auth/login')}
      />
      <Route
        component={MustNotBeAuthComponent(Register)}
        path={window.Tensei.getPath('auth/register')}
      />
    </>
  )
}

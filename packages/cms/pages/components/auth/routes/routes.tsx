import React from 'react'
import { Route } from 'react-router-dom'

import { Login } from '../../../auth/login'
import { Register } from '../../../auth/register'

export const AuthRoutes: React.FunctionComponent = () => {
  return (
    <>
      <Route component={Login} path={window.Tensei.getPath('auth/login')} />
      <Route
        component={Register}
        path={window.Tensei.getPath('auth/register')}
      />
    </>
  )
}

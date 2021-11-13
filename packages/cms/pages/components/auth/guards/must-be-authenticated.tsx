import React from 'react'
import { Redirect } from 'react-router-dom'

import { TenseiCtx } from '../context'

export const MustBeAuthComponent = (Component: React.FC) => {
  const Comp = (props: any) => {
    return (
      <TenseiCtx.Consumer>
        {({ user }) =>
          user ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={
                window.Tensei.state.registered
                  ? window.Tensei.getPath('auth/login')
                  : window.Tensei.getPath('auth/register')
              }
            />
          )
        }
      </TenseiCtx.Consumer>
    )
  }

  return Comp
}

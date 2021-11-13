import React from 'react'
import { Redirect } from 'react-router-dom'

import { TenseiCtx } from '../context'

export const MustBeNotAuthComponent = (Component: React.FC) => {
  const Comp = (props: any) => {
    return (
      <TenseiCtx.Consumer>
        {({ user }) =>
          !user ? (
            <Component {...props} />
          ) : (
            <Redirect to={window.Tensei.getPath('')} />
          )
        }
      </TenseiCtx.Consumer>
    )
  }

  return Comp
}

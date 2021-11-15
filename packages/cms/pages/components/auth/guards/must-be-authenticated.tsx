import React from 'react'
import { Redirect } from 'react-router-dom'
import { useAuthStore } from '../../../../store/auth'

export const MustBeAuthComponent = (Component: React.FC) => {
  const { user } = useAuthStore()

  const Comp = (props: any) => {
    return (
      <>
        {user ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={
              window.Tensei.state.registered
                ? window.Tensei.getPath('auth/login')
                : window.Tensei.getPath('auth/register')
            }
          />
        )}
      </>
    )
  }

  return Comp
}

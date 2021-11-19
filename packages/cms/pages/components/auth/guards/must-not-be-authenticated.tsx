import React from 'react'
import { Redirect } from 'react-router-dom'
import { useAuthStore } from '../../../../store/auth'

export const MustNotBeAuthComponent = (Component: React.FC) => {
  const { user } = useAuthStore()

  const Comp = (props: any) => {
    return (
      <>
        {!user ? (
          <Component {...props} />
        ) : (
          <Redirect to={window.Tensei.getPath('')} />
        )}
      </>
    )
  }

  return Comp
}

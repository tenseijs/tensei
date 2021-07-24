import { ComponentType } from 'react'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from 'next'

import { getProfileUrl, withSession } from './utils'

import { redirectIfAuthenticated as redirectIfAuthenticatedCsr } from './frontend/redirect-if-authenticated'

export type MustBeAuthenticatedOptions = {
  getServerSideProps?: GetServerSideProps
}

export const redirectIfAuthenticated = (
  optsOrComponent?: ComponentType<any> | MustBeAuthenticatedOptions
) => {
  if (typeof optsOrComponent === 'function') {
    return redirectIfAuthenticatedCsr(optsOrComponent)
  }

  const { getServerSideProps } = optsOrComponent || {}

  return withSession(async function (
    ctx: any
  ): Promise<GetServerSidePropsResult<any>> {
    const auth = ctx.req.session.get('auth')

    if (auth) {
      // user is not authentication
      return {
        redirect: {
          statusCode: 301,
          destination: getProfileUrl()
        }
      }
    }

    let response: GetServerSidePropsResult<any> = {
      props: {}
    }

    if (getServerSideProps) {
      response = await getServerSideProps(
        (ctx as unknown) as GetServerSidePropsContext
      )
    }

    return response
  } as any)
}

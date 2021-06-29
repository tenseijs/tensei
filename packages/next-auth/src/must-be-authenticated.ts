import { ComponentType } from 'react'
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

import { getLoginUrl, withSession } from './utils'

import { mustBeAuthenticated as mustBeAuthenticatedCsr } from './frontend/must-be-authenticated'

export type MustBeAuthenticatedOptions = {
  getServerSideProps?: GetServerSideProps
}

export const mustBeAuthenticated = (
  optsOrComponent: ComponentType<any> | MustBeAuthenticatedOptions
) => {
  if (typeof optsOrComponent === 'function') {
    return mustBeAuthenticatedCsr(optsOrComponent)
  }

  const { getServerSideProps } = optsOrComponent || {}

  return withSession(async function (ctx: any): Promise<GetServerSidePropsResult<any>> {
    const auth = ctx.req.session.get('auth')

    if (!auth) {
      // user is not authentication
      return {
        redirect: {
          statusCode: 301,
          destination: getLoginUrl(),
        },
      }
    }

    let response: GetServerSidePropsResult<any> = {
      props: {},
    }

    if (getServerSideProps) {
      response = await getServerSideProps((ctx as unknown) as GetServerSidePropsContext)
    }

    return response
  } as any)
}

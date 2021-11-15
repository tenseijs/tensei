import { setup, gql, fakeUser } from './setup'

import Supertest from 'supertest'
import { auth } from '@tensei/auth'
import { graphql } from '@tensei/graphql'

const generateTotp = (secret: string) => {
  const Speakeasy = require('speakeasy')

  const getTotp = () =>
    Speakeasy.totp({
      secret,
      encoding: 'base32'
    })

  let totp: string = getTotp()

  while (totp.startsWith('0')) {
    totp = getTotp()
  }

  return totp
}

test('registered user can enable, confirm and disable 2-factor authentication', async () => {
  const { app, ctx } = await setup([
    auth().twoFactorAuth().user('Student').plugin(),
    graphql().plugin()
  ])

  const client = Supertest(app)

  const fakeUserDetails = fakeUser()

  const register_response = await client.post(`/graphql`).send({
    query: gql`
      mutation register($email: String!, $password: String!) {
        register(object: { email: $email, password: $password }) {
          student {
            id
            email
          }
          accessToken
        }
      }
    `,
    variables: {
      email: fakeUserDetails.email,
      password: 'password'
    }
  })

  expect(register_response.status).toBe(200)

  const enable_2fa_response = await client
    .post(`/graphql`)
    .send({
      query: gql`
        mutation enableTwoFactorAuth {
          enableTwoFactorAuth {
            dataURL
          }
        }
      `
    })
    .set(
      'Authorization',
      `Bearer ${register_response.body.data.register.accessToken}`
    )

  expect(enable_2fa_response.status).toBe(200)
  expect(enable_2fa_response.body.data.enableTwoFactorAuth.dataURL).toMatch(
    'data:image/png;base64'
  )

  const user = await ctx.orm.em.findOne<{
    id: string
    twoFactorSecret: string
    email: string
  }>('Student', {
    email: fakeUserDetails.email
  })

  const totp = generateTotp(user.twoFactorSecret)

  const confirm_enable_2fa_response = await client
    .post(`/graphql`)
    .send({
      query: gql`
        mutation confirmEnableTwoFactorAuth($token: String!) {
          confirmEnableTwoFactorAuth(object: { token: $token }) {
            id
            twoFactorEnabled
          }
        }
      `,
      variables: {
        token: totp
      }
    })
    .set(
      'Authorization',
      `Bearer ${register_response.body.data.register.accessToken}`
    )

  expect(confirm_enable_2fa_response.status).toBe(200)
  expect(
    confirm_enable_2fa_response.body.data.confirmEnableTwoFactorAuth
  ).toEqual({
    id: user.id.toString(),
    twoFactorEnabled: true
  })

  const disable_2fa_response = await client
    .post(`/graphql`)
    .send({
      query: gql`
        mutation disableTwoFactorAuth($token: Int!) {
          disableTwoFactorAuth(object: { token: $token }) {
            id
            twoFactorEnabled
          }
        }
      `,
      variables: {
        token: parseInt(totp)
      }
    })
    .set(
      'Authorization',
      `Bearer ${register_response.body.data.register.accessToken}`
    )

  expect(disable_2fa_response.status).toBe(200)
  expect(disable_2fa_response.body.data.disableTwoFactorAuth).toEqual({
    id: user.id.toString(),
    twoFactorEnabled: false
  })
})

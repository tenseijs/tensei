import React from 'react'
import styled from 'styled-components'
import { AuthLayout } from '../../components/auth/layout'

import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiLink } from '@tensei/eui/lib/components/link'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiFormRow } from '@tensei/eui/lib/components/form'
import { EuiButton } from '@tensei/eui/lib/components/button'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { EuiFlexGroup } from '@tensei/eui/lib/components/flex'
import { EuiFieldText } from '@tensei/eui/lib/components/form/field_text'
import { EuiFieldPassword } from '@tensei/eui/lib/components/form/field_password'
import { EuiFlexItem } from '@tensei/eui/lib/components/flex/flex_item'
import { useState } from 'react'

const H3 = styled.h3`
  text-align: center;
`

export const Register: React.FunctionComponent = () => {
  const [user, setUser] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: ''
  })

  const submitRegistration = async (e: any) => {
    try {
      e.preventDefault()
      let resp = await window.Tensei.client.post('users', user)
      console.log(resp)
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <AuthLayout>
      <EuiTitle size="s">
        <H3>Create an admin account</H3>
      </EuiTitle>
      <EuiSpacer size="l" />
      <EuiText size="s" textAlign="center">
        Welcome to Tensei. Let's get you started by creating an administrator
        account. These credentials are securely stored in your database.
      </EuiText>

      <EuiSpacer size="xl" />

      <form method="post" onSubmit={submitRegistration}>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFormRow label="First name">
              <EuiFieldText
                autoFocus
                onChange={e => {
                  setUser({ ...user, firstname: e.target.value })
                }}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow label="Last name">
              <EuiFieldText
                onChange={e => {
                  setUser({ ...user, lastname: e.target.value })
                }}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="l" />

        <EuiFormRow label="Email">
          <EuiFieldText
            fullWidth
            onChange={e => {
              setUser({ ...user, email: e.target.value })
            }}
          />
        </EuiFormRow>

        <EuiSpacer size="l" />

        <EuiFormRow label="Password">
          <EuiFieldPassword
            type="dual"
            fullWidth
            onChange={e => {
              setUser({ ...user, password: e.target.value })
            }}
          />
        </EuiFormRow>

        <EuiSpacer size="l" />

        <EuiButton fullWidth fill type="submit">
          Get started
        </EuiButton>
      </form>

      <EuiSpacer size="m" />
      <EuiText size="xs" textAlign="center">
        By doing this, you agree to Tensei's{' '}
        <EuiLink
          target="_blank"
          href="https://tenseijs.com"
          referrerPolicy="no-referrer"
        >
          terms of use
        </EuiLink>
      </EuiText>
    </AuthLayout>
  )
}

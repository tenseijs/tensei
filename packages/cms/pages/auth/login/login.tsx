import React from 'react'
import styled from 'styled-components'
import { AuthLayout } from '../../components/auth/layout'

import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiFormRow } from '@tensei/eui/lib/components/form'
import { EuiButton } from '@tensei/eui/lib/components/button'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { EuiFieldText } from '@tensei/eui/lib/components/form/field_text'
import { EuiFieldPassword } from '@tensei/eui/lib/components/form/field_password'

const H3 = styled.h3`
  text-align: center;
`

export const Login: React.FunctionComponent = () => {
  return (
    <AuthLayout>
      <EuiTitle size="s">
        <H3>Welcome back</H3>
      </EuiTitle>
      <EuiSpacer size="xs" />
      <EuiText size="s" textAlign="center">
        Log in to your Tensei account
      </EuiText>

      <EuiSpacer size="xl" />

      <EuiFormRow label="Email">
        <EuiFieldText fullWidth />
      </EuiFormRow>

      <EuiSpacer size="l" />

      <EuiFormRow label="Password">
        <EuiFieldPassword type="dual" fullWidth />
      </EuiFormRow>

      <EuiSpacer size="xl" />

      <EuiButton fullWidth fill>
        Log in
      </EuiButton>
    </AuthLayout>
  )
}

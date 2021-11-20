import React, { FormEvent, useState } from 'react'
import styled from 'styled-components'
import { AuthLayout } from '../../components/auth/layout'

import { useAuthStore, LoginInput } from '../../../store/auth'

import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiForm, EuiFormRow } from '@tensei/eui/lib/components/form'
import { EuiButton } from '@tensei/eui/lib/components/button'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { EuiFieldText } from '@tensei/eui/lib/components/form/field_text'
import { EuiFieldPassword } from '@tensei/eui/lib/components/form/field_password'
import { useForm } from '../../hooks/forms'

const H3 = styled.h3`
  text-align: center;
`

type LoginErrors = Partial<Record<keyof LoginInput, string[]>>

export const Login: React.FunctionComponent = () => {
  const { login } = useAuthStore()

  const { form, errors, submit, loading, setValue } = useForm<LoginInput>({
    defaultValues: {
      email: '',
      password: ''
    },
    onSubmit: login,
    onSuccess: () => {
      window.location.href = window.Tensei.getPath('')
    }
  })

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
      <EuiForm component="form" onSubmit={submit}>
        <EuiFormRow
          label="Email"
          error={errors?.email}
          isInvalid={!!errors?.email}
        >
          <EuiFieldText
            fullWidth
            value={form.email}
            isInvalid={!!errors?.email}
            onChange={event => setValue('email', event.target.value)}
          />
        </EuiFormRow>

        <EuiSpacer size="l" />

        <EuiFormRow
          label="Password"
          error={errors?.password}
          isInvalid={!!errors?.password}
        >
          <EuiFieldPassword
            type="dual"
            fullWidth
            value={form.password}
            isInvalid={!!errors?.email}
            onChange={event => setValue('password', event.target.value)}
          />
        </EuiFormRow>

        <EuiSpacer size="xl" />

        <EuiButton fullWidth fill type="submit" isLoading={loading}>
          Log in
        </EuiButton>
      </EuiForm>
    </AuthLayout>
  )
}

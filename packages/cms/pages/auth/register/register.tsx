import React from 'react'
import styled from 'styled-components'
import { AuthLayout } from '../../components/auth/layout'

import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiLink } from '@tensei/eui/lib/components/link'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiForm, EuiFormRow } from '@tensei/eui/lib/components/form'
import { EuiButton } from '@tensei/eui/lib/components/button'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { EuiFlexGroup } from '@tensei/eui/lib/components/flex'
import { EuiFieldText } from '@tensei/eui/lib/components/form/field_text'
import { EuiFieldPassword } from '@tensei/eui/lib/components/form/field_password'
import { EuiFlexItem } from '@tensei/eui/lib/components/flex/flex_item'
import { RegisterUserInput, useAuthStore } from '../../../store/auth'
import { useForm } from '../../hooks/forms'

const H3 = styled.h3`
  text-align: center;
`

export const Register: React.FunctionComponent = () => {
  const { register } = useAuthStore()

  const {
    form,
    errors,
    submit,
    loading,
    setValue
  } = useForm<RegisterUserInput>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    },
    onSubmit: register,
    onSuccess: () => {
      window.location.href = window.Tensei.getPath('')
    }
  })

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

      <form method="post" onSubmit={submit} noValidate>
        <EuiForm component="div">
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormRow
                label="First name"
                isInvalid={!!errors?.firstName}
                error={errors?.firstName}
              >
                <EuiFieldText
                  autoFocus
                  isInvalid={!!errors?.firstName}
                  onChange={event => setValue('firstName', event.target.value)}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow
                label="Last name"
                error={errors?.lastName}
                isInvalid={!!errors?.lastName}
              >
                <EuiFieldText
                  isInvalid={!!errors?.lastName}
                  onChange={event => setValue('lastName', event.target.value)}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size="l" />

          <EuiFormRow
            label="Email"
            error={errors?.email}
            isInvalid={!!errors?.email}
          >
            <EuiFieldText
              fullWidth
              isInvalid={!!errors?.lastName}
              onChange={event => setValue('email', event.target.value)}
            />
          </EuiFormRow>

          <EuiSpacer size="l" />

          <EuiFormRow
            label="Password"
            isInvalid={!!errors?.password}
            error={errors?.password}
          >
            <EuiFieldPassword
              type="dual"
              fullWidth
              onChange={event => setValue('password', event.target.value)}
              isInvalid={!!errors?.password}
            />
          </EuiFormRow>

          <EuiSpacer size="l" />

          <EuiButton fullWidth fill type="submit" isLoading={loading}>
            Get started
          </EuiButton>
        </EuiForm>
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

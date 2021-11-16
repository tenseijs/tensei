import React, { FormEvent } from 'react'
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
import { useState } from 'react'
import { RegisterCredentials, useAuthStore } from '../../../store/auth'

const H3 = styled.h3`
  text-align: center;
`

// Define errors type
type RegisterErrors = Partial<Record<keyof RegisterCredentials, string[]>>

export const Register: React.FunctionComponent = () => {
  const { register } = useAuthStore()

  const [user, setUser] = useState<RegisterCredentials>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })

  // declare page states
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    setIsSubmitting(true)
    const [response, error] = await register(user)

    if (error) {
      let errorData = error.response?.data?.errors

      let errors: RegisterErrors = {}

      // get error messages
      errorData.forEach((error: { message: string; field: string }) => {
        errors[error.field as keyof RegisterErrors] = [error.message]
      })

      setErrors({ ...errors })
      setIsSubmitting(false)
      return
    }

    window.location.href = window.Tensei.getPath('')
    setIsSubmitting(false)
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

      <form method="post" onSubmit={onSubmit} noValidate>
        <EuiForm component="div">
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormRow
                label="First name"
                isInvalid={errors?.firstName && true}
                error={errors?.firstName}
              >
                <EuiFieldText
                  autoFocus
                  onChange={changeEvent => {
                    errors.firstName = undefined
                    setUser({ ...user, firstName: changeEvent.target.value })
                  }}
                  isInvalid={errors?.firstName && true}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow
                label="Last name"
                isInvalid={errors?.lastName && true}
                error={errors?.lastName}
              >
                <EuiFieldText
                  onChange={changeEvent => {
                    errors.lastName = undefined
                    setUser({ ...user, lastName: changeEvent.target.value })
                  }}
                  isInvalid={errors?.lastName && true}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size="l" />

          <EuiFormRow
            label="Email"
            isInvalid={errors?.email && true}
            error={errors?.email}
          >
            <EuiFieldText
              fullWidth
              onChange={changeEvent => {
                errors.email = undefined
                setUser({ ...user, email: changeEvent.target.value })
              }}
              isInvalid={errors?.email && true}
            />
          </EuiFormRow>

          <EuiSpacer size="l" />

          <EuiFormRow
            label="Password"
            isInvalid={errors?.password && true}
            error={errors?.password}
          >
            <EuiFieldPassword
              type="dual"
              fullWidth
              onChange={changeEvent => {
                errors.password = undefined
                setUser({ ...user, password: changeEvent.target.value })
              }}
              isInvalid={errors?.password && true}
            />
          </EuiFormRow>

          <EuiSpacer size="l" />

          <EuiButton fullWidth fill type="submit" isLoading={isSubmitting}>
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

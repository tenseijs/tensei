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

export const Register: React.FunctionComponent = () => {
  const { register } = useAuthStore()

  const [user, setUser] = useState<RegisterCredentials>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState<{
    firstName: String[]
    lastName: String[]
    email: String[]
    password: String[]
  }>({
    firstName: [],
    lastName: [],
    email: [],
    password: []
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    const [response, error] = await register(user)

    if (error) {
      let errorData = error.response?.data?.errors

      let firstNameErrors: String[] = []
      let lastNameErrors: String[] = []
      let emailErrors: String[] = []
      let passwordErrors: String[] = []

      // get the error message for each field
      errorData.forEach((error: { message: String; field: String }) => {
        if (error.field == 'firstName') firstNameErrors.push(error.message)
        if (error.field == 'lastName') lastNameErrors.push(error.message)
        if (error.field == 'email') emailErrors.push(error.message)
        if (error.field == 'password') passwordErrors.push(error.message)
      })
      setErrors({
        firstName: firstNameErrors,
        lastName: lastNameErrors,
        email: emailErrors,
        password: passwordErrors
      })

      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    window.location.href = window.Tensei.getPath('')
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
                isInvalid={errors.firstName.length > 0}
                error={errors.firstName}
              >
                <EuiFieldText
                  autoFocus
                  onChange={changeEvent => {
                    setUser({ ...user, firstName: changeEvent.target.value })
                  }}
                  isInvalid={errors.firstName.length > 0}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow
                label="Last name"
                isInvalid={errors.lastName.length > 0}
                error={errors.lastName}
              >
                <EuiFieldText
                  onChange={changeEvent => {
                    setUser({ ...user, lastName: changeEvent.target.value })
                  }}
                  isInvalid={errors.lastName.length > 0}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size="l" />

          <EuiFormRow
            label="Email"
            isInvalid={errors.email.length > 0}
            error={errors.email}
          >
            <EuiFieldText
              fullWidth
              onChange={changeEvent => {
                setUser({ ...user, email: changeEvent.target.value })
              }}
              isInvalid={errors.email.length > 0}
            />
          </EuiFormRow>

          <EuiSpacer size="l" />

          <EuiFormRow
            label="Password"
            isInvalid={errors.password.length > 0}
            error={errors.password}
          >
            <EuiFieldPassword
              type="dual"
              fullWidth
              onChange={changeEvent => {
                setUser({ ...user, password: changeEvent.target.value })
              }}
              isInvalid={errors.password.length > 0}
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

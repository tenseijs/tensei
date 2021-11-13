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

const H3 = styled.h3`
  text-align: center;
`

export const Register: React.FunctionComponent = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState([])
  const [errorIndicators, setErrorIndicators] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false
  })
  const [showErrors, setShowErrors] = useState(false)

  const onSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    try {
      setShowErrors(false)
      await window.Tensei.client.get('csrf')
      let response = await window.Tensei.client.post('/auth/register', user)
      console.log(response)
      window.location.href = window.Tensei.getPath('')
    } catch (error) {
      let errorData = error.response.data.errors

      // get the error indicator for each field
      setErrorIndicators({
        firstName: errorData.some(
          (error: { message: String; field: String }) => {
            return error.field == 'firstName'
          }
        ),
        lastName: errorData.some(
          (error: { message: String; field: String }) => {
            return error.field == 'lastName'
          }
        ),
        email: errorData.some((error: { message: String; field: String }) => {
          return error.field == 'email'
        }),
        password: errorData.some(
          (error: { message: String; field: String }) => {
            return error.field == 'password'
          }
        )
      })

      // map validation errors
      let validationErrors = errorData.map(
        (error: { message: String; field: String }) => error.message
      )

      setErrors(validationErrors)
      setShowErrors(true)
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

      <form method="post" onSubmit={onSubmit} noValidate>
        <EuiForm component="div" isInvalid={showErrors} error={errors}>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFormRow label="First name">
                <EuiFieldText
                  autoFocus
                  onChange={changeEvent => {
                    setUser({ ...user, firstName: changeEvent.target.value })
                  }}
                  isInvalid={errorIndicators.firstName}
                />
              </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFormRow label="Last name">
                <EuiFieldText
                  onChange={changeEvent => {
                    setUser({ ...user, lastName: changeEvent.target.value })
                  }}
                  isInvalid={errorIndicators.lastName}
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiSpacer size="l" />

          <EuiFormRow label="Email">
            <EuiFieldText
              fullWidth
              onChange={changeEvent => {
                setUser({ ...user, email: changeEvent.target.value })
              }}
              isInvalid={errorIndicators.email}
            />
          </EuiFormRow>

          <EuiSpacer size="l" />

          <EuiFormRow label="Password">
            <EuiFieldPassword
              type="dual"
              fullWidth
              onChange={changeEvent => {
                setUser({ ...user, password: changeEvent.target.value })
              }}
              isInvalid={errorIndicators.password}
            />
          </EuiFormRow>

          <EuiSpacer size="l" />

          <EuiButton fullWidth fill type="submit">
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

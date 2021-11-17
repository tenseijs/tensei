import React, { FormEvent, useState } from 'react'
import styled from 'styled-components'
import { AuthLayout } from '../../components/auth/layout'

import { useAuthStore, LoginCredentials } from '../../../store/auth'

import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiForm, EuiFormRow } from '@tensei/eui/lib/components/form'
import { EuiButton } from '@tensei/eui/lib/components/button'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { EuiFieldText } from '@tensei/eui/lib/components/form/field_text'
import { EuiFieldPassword } from '@tensei/eui/lib/components/form/field_password'

const H3 = styled.h3`
  text-align: center;
`

type LoginErrors = Partial<Record<keyof LoginCredentials, string[]>>


export const Login: React.FunctionComponent = () => {
  const [userDetails, setUserDetails] = useState<LoginCredentials>({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState<LoginErrors>({})
  const [loading, setLoading] = useState(false)

  const { login } = useAuthStore()

  const onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target
    setUserDetails({...userDetails, email: value})
  } 

  const onChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target
    setUserDetails({...userDetails, password: value})
  }

  const onLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setLoading(true)
    
    const [response, error] = await login(userDetails)

    if (error) {
      let errors: LoginErrors = {}

      error.response?.data.forEach((error: { message: string; field: string }) => {
        errors[error.field as keyof LoginErrors] = [error.message]
      })

      setErrors({ ...errors })
      setLoading(false)
      
      return
    }

    window.location.href = window.Tensei.getPath('')
    setLoading(false)
  }

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
      <EuiForm component="form" onSubmit={onLogin}>
        <EuiFormRow label="Email" isInvalid={errors.email && true}  error={errors.email} >
          <EuiFieldText fullWidth 
            onChange={onChangeEmail} 
            isInvalid={errors.email && true}
          />
        </EuiFormRow>

        <EuiSpacer size="l" />

        <EuiFormRow label="Password" isInvalid={errors.password && true} error={errors.password}>
          <EuiFieldPassword type="dual" fullWidth 
            onChange={onChangePassword} 
            isInvalid={errors.password && true}
          />
        </EuiFormRow>

        <EuiSpacer size="xl" />

        <EuiButton fullWidth fill type='submit' isLoading={loading} >
            Log in
        </EuiButton>
      
      </EuiForm>

    </AuthLayout>
  )
}

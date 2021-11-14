import React, { FormEventHandler, useState } from 'react'
import styled from 'styled-components'
import { AuthLayout } from '../../components/auth/layout'

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

export const Login: React.FunctionComponent = () => {
  const [userDetails, setUserDetails] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState(false)

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setUserDetails({...userDetails, email: value})
  } 

  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setUserDetails({...userDetails, password: value})
  }

  const onLogin: FormEventHandler = async (event) => {
    event.preventDefault()

    await window.Tensei.client.post('/auth/login', userDetails)
    .then(response => {
      console.log(response)
    })
    .catch(error => {
      console.log(error)

      setErrors(true)

     if(!error) {
        window.location.href = window.Tensei.getPath('')
      }
    })
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
      <EuiForm component="div" isInvalid={errors}>
        <EuiFormRow label="Email">
          <EuiFieldText fullWidth isInvalid={errors}
            onChange={onChangeEmail} 
          />
        </EuiFormRow>

        <EuiSpacer size="l" />

        <EuiFormRow label="Password">
          <EuiFieldPassword type="dual" fullWidth isInvalid={errors}
            onChange={onChangePassword} 
          />
        </EuiFormRow>

        <EuiSpacer size="xl" />

        <EuiButton fullWidth fill onClick={onLogin} type='submit' >
            Log in
        </EuiButton>
      
      </EuiForm>

    </AuthLayout>
  )
}

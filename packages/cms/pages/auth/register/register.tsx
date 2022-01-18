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
import {
  JoinTeamInput,
  RegisterUserInput,
  useAuthStore
} from '../../../store/auth'
import { useForm } from '../../hooks/forms'
import { useHistory, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useState } from 'react'
import { useToastStore } from '../../../store/toast'

const H3 = styled.h3`
  text-align: center;
`

export const Register: React.FunctionComponent = () => {
  const { register, verifyInviteCode } = useAuthStore()
  const params = useParams<{ invite: string }>()
  const [verified, setVerified] = useState(false)
  const { replace } = useHistory()
  const { toast } = useToastStore()

  const { form, errors, submit, loading, setValue, setForm } = useForm<
    RegisterUserInput & JoinTeamInput
  >({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      inviteCode: ''
    },
    onSubmit: register,
    onSuccess: () => {
      window.location.href = window.Tensei.getPath('')
    }
  })

  const verifyMember = async () => {
    const [response, error] = await verifyInviteCode(params?.invite)

    if (error) {
      toast('Invalid', error.response?.data?.errors[0]?.message)
      replace(window.Tensei.getPath('auth/login'))
    } else {
      setForm({
        firstName: response?.data?.firstName,
        lastName: response?.data?.lastName,
        email: response?.data?.email,
        password: '',
        inviteCode: params?.invite
      })
    }
  }

  useEffect(() => {
    if (params?.invite && !verified) {
      verifyMember()
      setVerified(true)
    }
  })

  return (
    <AuthLayout>
      <EuiTitle size="s">
        <H3>
          {params?.invite
            ? 'Join your team on tensei'
            : 'Create an admin account'}
        </H3>
      </EuiTitle>
      <EuiSpacer size="l" />
      <EuiText size="s" textAlign="center">
        {params?.invite
          ? "You've been invited to join the team at tensei CMS, choose your password to get started."
          : "Welcome to Tensei. Let's get you started by creating an administrator account. These credentials are securely stored in your database."}
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
                  value={!!params?.invite ? form?.firstName : ''}
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
                  value={!!params?.invite ? form?.lastName : ''}
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
              isInvalid={!!errors?.email}
              readOnly={!!params?.invite}
              value={!!params?.invite ? form?.email : ''}
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
            {params?.invite ? 'Join team' : 'Get started'}
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

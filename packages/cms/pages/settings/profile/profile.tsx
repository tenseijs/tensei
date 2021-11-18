import styled from 'styled-components'
import React, { FunctionComponent, Fragment, FormEvent } from 'react'
import { DashboardLayout } from '../../components/dashboard/layout'

import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiLink } from '@tensei/eui/lib/components/link'
import { EuiAvatar } from '@tensei/eui/lib/components/avatar'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { EuiButton } from '@tensei/eui/lib/components/button'
import { EuiFlexGroup, EuiFlexItem } from '@tensei/eui/lib/components/flex'
import { EuiDescribedFormGroup } from '@tensei/eui/lib/components/form/described_form_group'
import {
  EuiFieldText,
  EuiFieldPassword,
  EuiForm,
  EuiFormRow
} from '@tensei/eui/lib/components/form'
import { UpdateProfileCredentials, useAuthStore } from '../../../store/auth'
import { useState } from 'react'
import { useEffect } from 'react'

const PageTitle = styled.div`
  display: flex;
  gap: 24px;
  padding-bottom: 40px;
  align-items: center;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const FormWrapper = styled.div`
  width: 90%;
`

const SpacerBottom = styled(EuiSpacer)`
  ${({ theme }) => `border-bottom: ${theme.border.thin}`}
`

interface ProfileProps {}

type UpdateProfileErrors = Partial<
  Record<keyof UpdateProfileCredentials, string[]>
>

export const Profile: FunctionComponent<ProfileProps> = () => {
  const { user, setUser, updateProfile } = useAuthStore()
  const [profile, setProfile] = useState<UpdateProfileCredentials>()
  const [pageHasLoaded, setPageLoaded] = useState(false)
  const [isUpdatingProfile, setUpdatingProfile] = useState(false)
  const [
    updateProfileErrors,
    setUpdateProfileErrors
  ] = useState<UpdateProfileErrors>({})

  useEffect(() => {
    if (!pageHasLoaded) {
      const { firstName, lastName, email } = user
      setProfile({ firstName, lastName, email })
      setPageLoaded(true)
    }
  })

  const onUpdateProfile = async (onSubmitEvent: FormEvent<HTMLFormElement>) => {
    onSubmitEvent.preventDefault()

    setUpdatingProfile(true)
    const [response, error] = await updateProfile(profile!)

    if (error) {
      let errorData = error.response?.data?.errors

      let errors: UpdateProfileErrors = {}

      // get error messages
      errorData.forEach((error: { message: string; field: string }) => {
        errors[error.field as keyof UpdateProfileErrors] = [error.message]
      })

      setUpdateProfileErrors({ ...errors })
      setUpdatingProfile(false)
      return
    }

    setUpdatingProfile(false)
    setUser({ ...user, ...profile })
  }

  return (
    <DashboardLayout>
      <Wrapper>
        <PageTitle>
          <EuiAvatar
            size="xl"
            imageUrl="https://avatars0.githubusercontent.com/u/19477966"
            name={`${user.firstName} ${user.lastName}`}
          ></EuiAvatar>

          <EuiText>
            <h1>
              {user.firstName} {user.lastName}
            </h1>
          </EuiText>
        </PageTitle>

        <FormWrapper>
          <EuiForm component="form" onSubmit={onUpdateProfile}>
            <EuiDescribedFormGroup
              fullWidth
              title={<h3>Profile</h3>}
              description={
                <Fragment>
                  Update your profile information. If you update your email,
                  you'll have to use your new email when logging in next time.
                </Fragment>
              }
            >
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiFormRow
                    label="First name"
                    error={updateProfileErrors?.firstName}
                    isInvalid={updateProfileErrors?.firstName && true}
                  >
                    <EuiFieldText
                      value={profile?.firstName}
                      onChange={onChangeEvent => {
                        updateProfileErrors.firstName = undefined
                        setProfile({
                          ...profile!,
                          firstName: onChangeEvent.target.value
                        })
                      }}
                      isInvalid={updateProfileErrors?.firstName && true}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFormRow
                    label="Last name"
                    error={updateProfileErrors?.lastName}
                    isInvalid={updateProfileErrors?.lastName && true}
                  >
                    <EuiFieldText
                      value={profile?.lastName}
                      onChange={onChangeEvent => {
                        updateProfileErrors.lastName = undefined
                        setProfile({
                          ...profile!,
                          lastName: onChangeEvent.target.value
                        })
                      }}
                      isInvalid={updateProfileErrors?.lastName && true}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>

              <EuiSpacer size="l" />

              <EuiFormRow
                fullWidth
                label="Email"
                error={updateProfileErrors?.email}
                isInvalid={updateProfileErrors?.email && true}
              >
                <EuiFieldText
                  fullWidth
                  value={profile?.email}
                  onChange={onChangeEvent => {
                    updateProfileErrors.email = undefined
                    setProfile({
                      ...profile!,
                      email: onChangeEvent.target.value
                    })
                  }}
                  isInvalid={updateProfileErrors?.email && true}
                />
              </EuiFormRow>

              <EuiSpacer size="l" />

              <div>
                <EuiButton fill type="submit" isLoading={isUpdatingProfile}>
                  Update profile
                </EuiButton>
              </div>
            </EuiDescribedFormGroup>

            <SpacerBottom />
          </EuiForm>

          <EuiSpacer size="xl" />

          <EuiForm component="form">
            <EuiDescribedFormGroup
              fullWidth
              title={<h3>Update password</h3>}
              description={
                <Fragment>
                  You may change your password here. The next time you log in,
                  you would have to use your new password.
                </Fragment>
              }
            >
              <EuiFormRow label="Current password">
                <EuiFieldPassword type="dual" />
              </EuiFormRow>
              <EuiFormRow label="New password">
                <EuiFieldPassword type="dual" />
              </EuiFormRow>

              <EuiSpacer size="l" />

              <div>
                <EuiButton fill>Update password</EuiButton>
              </div>
            </EuiDescribedFormGroup>
          </EuiForm>
        </FormWrapper>
      </Wrapper>
    </DashboardLayout>
  )
}

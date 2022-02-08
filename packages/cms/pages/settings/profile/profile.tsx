import styled from 'styled-components'
import React, { FunctionComponent, Fragment } from 'react'

import { EuiText } from '@tensei/eui/lib/components/text'
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
import {
  UpdateUserProfileInput,
  UpdateUserPasswordInput,
  useAuthStore
} from '../../../store/auth'
import { useToastStore } from '../../../store/toast'
import { useForm } from '../../hooks/forms'
import { getUserGravatar } from '../../../utils/gravatar'

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

const PageWrapper = styled.div`
  width: 100%;
  padding: 40px;
  margin-bottom: 40px;
`

interface ProfileProps {}

export const Profile: FunctionComponent<ProfileProps> = () => {
  const { user, setUser, updateProfile, updatePassword } = useAuthStore()
  const {
    setValue: setProfileFormValue,
    form: updateProfileForm,
    loading: isUpdatingProfile,
    submit: onProfileUpdateSubmit,
    errors: updateProfileErrors
  } = useForm<UpdateUserProfileInput>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    },
    onSubmit: updateProfile,
    onSuccess: ({ form }) => {
      setUser({
        ...user,
        ...form
      })

      toast('Saved.', <p>Profile information updated successfully.</p>)
    }
  })

  const {
    setValue: setPasswordFormValue,
    form: updatePasswordForm,
    loading: isUpdatingPassword,
    submit: onUpdatePasswordSubmit,
    errors: updatePasswordErrors
  } = useForm<UpdateUserPasswordInput>({
    defaultValues: {
      currentPassword: '',
      newPassword: ''
    },
    onSubmit: updatePassword,
    onSuccess: ({ form }) => {
      setUser({
        ...user,
        ...form
      })

      toast('Saved.', <p>Your password has been updated successfully.</p>)
    }
  })

  const { toast } = useToastStore()

  return (
    <PageWrapper>
      <Wrapper>
        <PageTitle>
          <EuiAvatar
            size="xl"
            imageUrl={getUserGravatar()}
            name={`${user.firstName} ${user.lastName}`}
          ></EuiAvatar>

          <EuiText>
            <h1>
              {user.firstName} {user.lastName}
            </h1>
          </EuiText>
        </PageTitle>

        <FormWrapper>
          <EuiForm component="form" onSubmit={onProfileUpdateSubmit}>
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
                    isInvalid={!!updateProfileErrors?.firstName}
                  >
                    <EuiFieldText
                      value={updateProfileForm?.firstName}
                      onChange={event =>
                        setProfileFormValue('firstName', event?.target.value)
                      }
                      isInvalid={!!updateProfileErrors?.firstName}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFormRow
                    label="Last name"
                    error={updateProfileErrors?.lastName}
                    isInvalid={!!updateProfileErrors?.lastName}
                  >
                    <EuiFieldText
                      value={updateProfileForm?.lastName}
                      onChange={event => {
                        setProfileFormValue('lastName', event.target.value)
                      }}
                      isInvalid={!!updateProfileErrors?.lastName}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>

              <EuiSpacer size="l" />

              <EuiFormRow
                fullWidth
                label="Email"
                error={updateProfileErrors?.email}
                isInvalid={!!updateProfileErrors?.email}
              >
                <EuiFieldText
                  fullWidth
                  value={updateProfileForm?.email}
                  onChange={event => {
                    setProfileFormValue('email', event.target.value)
                  }}
                  isInvalid={!!updateProfileErrors?.email}
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

          <EuiSpacer size="l" />

          <EuiForm component="form" onSubmit={onUpdatePasswordSubmit}>
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
              <EuiFormRow
                label="Current password"
                isInvalid={!!updatePasswordErrors?.currentPassword}
                error={updatePasswordErrors?.currentPassword}
              >
                <EuiFieldPassword
                  type="dual"
                  value={updatePasswordForm?.currentPassword}
                  isInvalid={!!updatePasswordErrors?.currentPassword}
                  onChange={event =>
                    setPasswordFormValue('currentPassword', event.target.value)
                  }
                />
              </EuiFormRow>
              <EuiFormRow
                label="New password"
                error={updatePasswordErrors?.newPassword}
                isInvalid={!!updatePasswordErrors?.newPassword}
              >
                <EuiFieldPassword
                  type="dual"
                  value={updatePasswordForm?.newPassword}
                  onChange={event =>
                    setPasswordFormValue('newPassword', event.target.value)
                  }
                  isInvalid={!!updatePasswordErrors?.newPassword}
                />
              </EuiFormRow>

              <EuiSpacer size="l" />

              <div>
                <EuiButton fill type="submit" isLoading={isUpdatingPassword}>
                  Update password
                </EuiButton>
              </div>
            </EuiDescribedFormGroup>
          </EuiForm>
        </FormWrapper>
      </Wrapper>
    </PageWrapper>
  )
}

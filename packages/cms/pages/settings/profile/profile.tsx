import styled from 'styled-components'
import React, { FunctionComponent, Fragment } from 'react'
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

export const Profile: FunctionComponent<ProfileProps> = () => {
  return (
    <DashboardLayout>
      <Wrapper>
        <PageTitle>
          <EuiAvatar
            size="xl"
            imageUrl="https://avatars0.githubusercontent.com/u/19477966"
            name="Frantz Kati"
          ></EuiAvatar>

          <EuiText>
            <h1>Frantz Kati</h1>
          </EuiText>
        </PageTitle>

        <FormWrapper>
          <EuiForm component="form">
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
                  <EuiFormRow label="First name">
                    <EuiFieldText />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFormRow label="Last name">
                    <EuiFieldText />
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>

              <EuiSpacer size="l" />

              <EuiFormRow fullWidth label="Email">
                <EuiFieldText fullWidth />
              </EuiFormRow>

              <EuiSpacer size="l" />

              <div>
                <EuiButton fill>Update profile</EuiButton>
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

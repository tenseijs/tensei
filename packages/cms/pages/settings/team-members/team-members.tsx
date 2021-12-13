import styled from 'styled-components'
import React, { FunctionComponent } from 'react'

import { useAuthStore } from '../../../store/auth'
import { useToastStore } from '../../../store/toast'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const PageWrapper = styled.div`
  width: 100%;
  padding: 40px;
  margin-bottom: 40px;
`

interface ProfileProps {}

export const TeamMembers: FunctionComponent<ProfileProps> = () => {
  const { user, setUser, updateProfile, updatePassword } = useAuthStore()

  const { toast } = useToastStore()

  return (
    <PageWrapper>
      <Wrapper>
        <h1>team members</h1>
      </Wrapper>
    </PageWrapper>
  )
}

import React from 'react'
import styled from 'styled-components'

import { CommunityPanel } from './community-panel'

const Container = styled.div`
  display: flex;
  width: 100%;

   @media screen and (max-width: 767px) {
    display: block;
  }
`

const Content = styled.div`
  width: 70%;

  @media only screen and (max-width: 767px) {
    display: block;
    width: 100%;
    height: 100%;
  }
  
`


export const Dashboard: React.FunctionComponent = () => {
  return (
    <>
    <Container>
      <Content />
      <CommunityPanel />
    </Container>
    </>
  )
}

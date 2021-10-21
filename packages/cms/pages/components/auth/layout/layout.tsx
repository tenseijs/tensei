import React from 'react'
import styled from 'styled-components'
import { EuiPanel } from '@tensei/eui/lib/components/panel'

const Wrapper = styled.div`
  height: 100vh;
  width: 100%;
  padding-top: 64px;
  background-color: ${({ theme }) => theme.colors.bgShade};
`

const Card = styled(EuiPanel)`
  padding: 40px;
  max-width: 440px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`

const LogoWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
`

const Logo = styled.img``

export const AuthLayout: React.FunctionComponent = ({ children }) => {
  return (
    <Wrapper>
      <Card>
        <LogoWrapper>
          <Logo
            width={72}
            height={72}
            src={
              'https://res.cloudinary.com/bahdcoder/image/upload/v1630016927/Asset_5_4x_hykfhh.png'
            }
          />
        </LogoWrapper>

        {children}
      </Card>
    </Wrapper>
  )
}

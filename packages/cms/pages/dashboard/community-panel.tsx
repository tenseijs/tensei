import React, { useState } from 'react'
import styled from 'styled-components'

import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiButton } from '@tensei/eui/lib/components/button'
import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'

const Panel = styled.div`
  width: 35%;
  background-color: ${({ theme }) => theme.colors.bgShade};
  border-left: ${({ theme }) => theme.border.thin};

  @media screen and (max-width: 349px) {
    display: block;
    width: 100%;
    height: 100%;
    border-left: none;
  }
  
  @media screen and (min-width: 350px) and (max-width: 767px) {
    display: block;
    width: 100%;
    height: 90%;
    border-left: none;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    width: 45%;
  }
`

const PanelContentsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const PanelTitle = styled(EuiTitle)`
  font-weight: 500;
  line-height: 24px;

  @media screen and (max-width: 349px) {
    padding: 0 20px;
    text-align: center;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    padding: 0 10px;
    text-align: center;
  }

`

const ImagesContainer = styled.div`
  position: relative;

`

const PanelIcon = styled(EuiIcon)`
  width: 66px;
  height: 66px;
  margin: 1.5rem 0;

  @media screen and (max-width: 767px) {
    width: 40px;
    height: 40px;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    width: 50px;
    height: 45px;
    margin-bottom: 0;
  }
`

const PanelImageOne = styled.img`
  border-radius: 50%;
  position: absolute;
  top: 140px;
  left: 15%;
  width: 80px;
  height: 80px;

  @media screen and (max-width: 349px) {
    width: 40px;
    height: 40px;
  }

  @media screen and (min-width: 350px) and (max-width: 767px) {
    width: 50px;
    height: 50px;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    width: 45px;
    height: 45px;
    top: 110px;
    left: 15%;
  }
`

const PanelImageTwo = styled.img`
  border-radius: 50%;
  position: absolute;
  top: 100px;
  right: 48%;
  width: 65px;
  height: 65px;

  @media screen and (max-width: 349px) {
   width: 30px;
   height: 30px;
  }

  @media screen and (min-width: 350px) and (max-width: 767px) {
    width: 40px;
    height: 40px;
    right: 45%;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    width: 40px;
    height: 40px;
    top: 70px;
  }
`

const ImageThreeWrapper = styled.div`
  background: #f1f1f1;
  width: 202px;
  height: 202px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  top: 80px;
  right: -16px;
  position: absolute;

  @media screen and (max-width: 349px) {
    width: 100px;
    height: 110px;
  }
  
  @media screen and (min-width: 350px) and (max-width: 767px) {
    width: 130px;
    height: 130px;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    width: 110px;
    height: 110px;
  }
`

const PanelImageThree = styled.img`
  border-radius: 50%;
  width: 80px;
  height: 80px;

  
  @media screen and (max-width: 767px) {
    width: 50px;
    height: 50px;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    width: 45px;
    height: 45px;
  }
`

const PanelImageFour = styled.img`
  border-radius: 50%;
  position: absolute;
  top: 196px;
  right: 40%;
  width: 50px;
  height: 50px;

  @media screen and (max-width: 767px) {
    width: 30px;
    height: 30px;
    top: 165px;
    right: 35%;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    width: 32px;
    height: 32px;
    top: 150px;
    right: 32%;
  }
`

const PanelLine = styled.img`
  position: absolute;
  top: 110px;
  left: 23%;
  width: 30px;
  height: 30px;

  @media screen and (max-width: 767px) {
    width: 23px;
    height: 23px;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    height: 20px;
    top: 88px;
    left: 15%;
  }

`

const PanelStroke = styled.img`
  position: absolute;
  top: 87px;
  right: 115px;
  z-index: 100;
  width: 140px;
  height: 40px;

  @media screen and (max-width: 349px) {
    width: 80px;
    height: 30px;
    right: 58px;
    top: 80px;
  }

  @media screen and (min-width: 350px) and (max-width: 767px) {
    width: 90px;
    height: 30px;
    right: 90px;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    width: 100px;
    height: 35px;
    top: 50px;
    right: 40px;
  }
`

const PanelSpacer = styled.div`
  height: 320px;

  @media screen and (max-width: 767px) {
    height: 200px;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    height: 235px;
  }
`

const PanelText = styled(EuiText)`

  @media screen and (max-width: 349px) {
    padding: 0 20px;
    text-align: center;
  }

  @media screen and (min-width: 350px) and (max-width: 767px) {
    padding: 0 30px;
    text-align: center;
  }

  @media screen and (min-width: 768px) and (max-width: 1024px) {
    padding: 0 20px;
    text-align: center;
  }
`

const PanelButton = styled(EuiButton)`
 @media screen and (max-width: 349px) {
    width: 60px;
    padding-left: 0;
    padding-right: 0;
  }
`


export const CommunityPanel: React.FunctionComponent = () => {
  return (
    <Panel>
      <ImagesContainer>
        <PanelImageOne
          src={
            'https://res.cloudinary.com/annysah/image/upload/v1637918255/Mask_Group_2_xn6rpy.png'
          }
        ></PanelImageOne>

        <PanelLine
          src={
            'https://res.cloudinary.com/annysah/image/upload/v1637917573/Group_1_nmeuhs.png'
          }
        ></PanelLine>

        <PanelImageTwo
          src={
            'https://res.cloudinary.com/annysah/image/upload/v1637917708/Mask_Group_1_g1re8r.png'
          }
        ></PanelImageTwo>

        <PanelStroke
          src={
            'https://res.cloudinary.com/annysah/image/upload/v1637917599/Line_1_qbxaut.png'
          }
        ></PanelStroke>

        <ImageThreeWrapper>
          <PanelImageThree
            src={
              'https://res.cloudinary.com/annysah/image/upload/v1637918255/Mask_Group_cbu8eg.png'
            }
          ></PanelImageThree>
        </ImageThreeWrapper>

        <PanelImageFour
          src={
            'https://res.cloudinary.com/annysah/image/upload/v1637917673/Mask_Group_3_frpngx.png'
          }
        ></PanelImageFour>
      </ImagesContainer>

      <PanelSpacer />

      <PanelContentsWrapper>
        <PanelIcon
          type="data:image/png;base64,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"
          title="Discord Logo"
        ></PanelIcon>

        <PanelTitle size="xs">
          <h3>Join our Discord community</h3>
        </PanelTitle>

        <EuiSpacer size="s" />

        <PanelText size="xs">
          Our growing community helps you become a Tensei master
        </PanelText>

        <EuiSpacer size="m" />

        <PanelButton iconType="plusInCircle" fill>
          Join Discord Group
        </PanelButton>
      </PanelContentsWrapper>
    </Panel>
  )
}

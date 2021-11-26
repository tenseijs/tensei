import React, { useState } from 'react'
import styled from 'styled-components'

import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiButton } from '@tensei/eui/lib/components/button'
import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'

const Panel = styled.div`
    width: 280px;
    height: 100vh;
    position: fixed;
    top: 75px;
    right: 0;
    background-color: ${({ theme }) => theme.colors.bgShade};
`

const PanelContentsWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-top: 70%;
`

const PanelTitle = styled(EuiTitle)`
  font-size: 16px;
  font-weight: 500; 
  line-height: 24px;
`

const PanelText = styled(EuiText)`
  font-size: 11px;
  font-weight: 400;
  text-align: center; 
  padding: 0.75rem 2.1rem;
`

const PanelIcon = styled(EuiIcon)`
    width: 66px;
    height: 66px;
    margin: 1.5rem 0;
`

const PanelImageOne = styled.img`
    border-radius: 50%;
    position: absolute;
    top: 21%;
    left: 17%;
`

const PanelImageTwo = styled.img`
    border-radius: 50%;
    position: absolute;
    top: 14%;
    right: 48%;
`

const ImageThreeWrapper = styled.div`
    background: #f1f1f1;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    position: absolute;
    top: 80px;
    right: -8px;
`

const PanelImageThree = styled.img`
    border-radius: 50%;
    position: absolute;
    top: 35px;
    right: 35px;
`

const PanelImageFour = styled.img`
    border-radius: 50%;
    position: absolute;
    top: 23%;
    right: 37%;
`

const PanelLine = styled.img`
    position: absolute;
    top: 110px;
    left: 60px;
`

const PanelStroke = styled.img`
    position: absolute;
    top: 70px;
    right: 55px;
    z-index: 100;
`

export const CommunityPanel: React.FunctionComponent = () => {
    return (
        <Panel>
            <PanelImageOne
                width={50}
                height={50}
                src={
                    "https://res.cloudinary.com/annysah/image/upload/v1637918255/Mask_Group_2_xn6rpy.png"
                }
            ></PanelImageOne>  

            <PanelLine
                width={30}
                height={30}
                src={
                    "https://res.cloudinary.com/annysah/image/upload/v1637917573/Group_1_nmeuhs.png"
                }
            ></PanelLine>

            <PanelImageTwo
                width={40}
                height={40}
                src={
                    "https://res.cloudinary.com/annysah/image/upload/v1637917708/Mask_Group_1_g1re8r.png"
                }
            ></PanelImageTwo>

            <PanelStroke
                width={140}
                height={40}
                src={
                    "https://res.cloudinary.com/annysah/image/upload/v1637917599/Line_1_qbxaut.png"
                }
            ></PanelStroke>
            
            <ImageThreeWrapper>
                <PanelImageThree
                    width={50}
                    height={50}
                    src={
                        "https://res.cloudinary.com/annysah/image/upload/v1637918255/Mask_Group_cbu8eg.png"
                    }
                ></PanelImageThree>
            </ImageThreeWrapper>

            <PanelImageFour
                width={30}
                height={30}
                src={
                    "https://res.cloudinary.com/annysah/image/upload/v1637917673/Mask_Group_3_frpngx.png"
                }
            ></PanelImageFour>

            <EuiSpacer size="l" />

            <PanelContentsWrapper>
                <PanelIcon 
                    type="data:image/png;base64,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"
                    title='Discord Logo'
                ></PanelIcon>

                <PanelTitle>
                    <h4>Join our Discord community</h4>
                </PanelTitle>

                <PanelText>
                    Our growing community helps you become a Tensei master
                </PanelText>

                <EuiSpacer size="s" />

                <EuiButton fill >
                    Join Discord Group 
                </EuiButton>
                
            </PanelContentsWrapper>
        </Panel>
    )
}

import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon
} from '@tensei/eui/lib/components/button'
import { DashboardLayout } from '../../components/dashboard/layout'
import { useEffect } from 'react'
import { useResourceStore } from '../../../store/resource'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiText } from '@tensei/eui/lib/components/text'
import styled from 'styled-components'
import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import { AbstractData, ResourceContract } from '@tensei/components'
import { useEuiTheme } from '@tensei/eui/lib/services'
// import

const Sidebar = styled.div<{ close: boolean }>`
  background-color: #fcfcfc;
  display: flex;
  flex-direction: column;
  width: ${({ close }) => (close ? '0' : '35%')};
  height: 100%;
  position: relative;
  padding-top: 20px;
  border-left: ${({ theme, close }) => (close ? 'none' : theme.border.thin)};
`
const SidebarCollapseExpandIcon = styled.button<{ close: boolean }>`
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  position: absolute;
  border: ${({ theme }) => theme.border.thin};
  top: 23.5px;
  left: ${({ close }) => (close ? '-60px' : '-14px')};
  z-index: 99;
  background-color: ${({ theme }) => theme.colors.ghost};
`
const Title = styled.button`
  height: 40px;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const TitleUnderline = styled.div`
  width: 100%;
  ${({ theme }) => `border-bottom: ${theme.border.thin}`}
`
const Item = styled.div<{ close: boolean }>`
  width: 100%;
  display: ${({ close }) => (close ? 'none' : 'flex')};
  flex-direction: column;
  padding: 0 1.75rem;
`
const Contents = styled.div<{ close: boolean }>`
  width: 100%;
  display: ${({ close }) => (close ? 'none' : 'block')};
`
const Content = styled.div`
  width: 100%;
  display: flex;
  margin-bottom: 10px;
  justify-content: space-between;
`
const ValueText = styled(EuiText)`
  ${({ theme }) => `color: ${theme.colors.darkShade}`}
`

const SidebarItem: React.FunctionComponent<{
  children?: React.ReactNode
  title: string
  sidebarClose: boolean
}> = ({ children, title, sidebarClose }) => {
  const [close, setClose] = useState(false)
  const onCloseSideBar = () => setClose(!close)

  return (
    <Item close={sidebarClose}>
      <Title onClick={onCloseSideBar}>
        <EuiTitle size="xxxs">
          <h6>{title}</h6>
        </EuiTitle>
        <EuiIcon type={close ? 'arrowUp' : 'arrowDown'}></EuiIcon>
      </Title>
      <TitleUnderline />
      <EuiSpacer size="m" />
      <Contents close={close}>{children}</Contents>
    </Item>
  )
}

const CreateResourceSidebar: React.FunctionComponent<{
  resource: ResourceContract | undefined
}> = ({ resource }) => {
  const [close, setClose] = useState(false)
  const onCloseSideBar = () => setClose(!close)

  return (
    <Sidebar close={close}>
      <SidebarCollapseExpandIcon close={close} onClick={onCloseSideBar}>
        {close ? (
          <EuiIcon size="s" type="arrowLeft" onClick={onCloseSideBar} />
        ) : (
          <EuiIcon size="s" type="arrowRight" onClick={onCloseSideBar} />
        )}
      </SidebarCollapseExpandIcon>

      <SidebarItem
        title={`${resource?.name?.toUpperCase()} INFORMATION`}
        sidebarClose={close}
      >
        <Content>
          <EuiText size="s">Created by</EuiText>
          <ValueText size="s">-</ValueText>
        </Content>
        <Content>
          <EuiText size="s">Last updated</EuiText>
          <ValueText size="s">2 hours ago</ValueText>
        </Content>
      </SidebarItem>

      <EuiSpacer size="l" />

      <SidebarItem title="LOCALE" sidebarClose={close}>
        <Content>
          <ValueText size="s">en-US</ValueText>
        </Content>
      </SidebarItem>
    </Sidebar>
  )
}

const PublishAndSaveToDraftContainer = styled.div`
  gap: 0.75rem;
  display: flex;
  align-items: center;
`

const TitleAndBackButtonContainer = styled.div`
  gap: 0.75rem;
  display: flex;
  align-items: center;
`

const PageWrapper = styled.div`
  width: 100%;
  padding: 40px;
  margin-bottom: 40px;
`

export const CreateResource: React.FunctionComponent = () => {
  const { push } = useHistory()
  const theme = useEuiTheme()
  console.log(theme)
  const { findResource, resource } = useResourceStore()
  const { resource: resourceSlug } = useParams<{
    resource: string
  }>()
  const history = useHistory()

  useEffect(() => {
    const found = findResource(resourceSlug)

    if (!found) {
      push(window.Tensei.getPath(''))
    }
  }, [resourceSlug])

  if (!resource) {
    return <p>Loading ...</p> // show full page loader here.
  }

  // const [errors, setErrors] = useState<AbstractData>({})
  // const [saving, setSaving] = useState(false)
  // const [isEditing, setIsEditing] = useState(false)
  // const [form, setForm] = useState<AbstractData>({})
  // const [booted, setBooted] = useState(false)

  console.log('Components', JSON.stringify(window.Tensei.components))

  const TextComponent = window.Tensei.components.form.Text

  // const Component =
  // window.Tensei.components.form[field.component.form] ||
  // window.Tensei.components.form.Text
  // return <Component />

  return (
    <DashboardLayout>
      <DashboardLayout.Sidebar title="Content"></DashboardLayout.Sidebar>

      <DashboardLayout.Body>
        <DashboardLayout.Topbar>
          <TitleAndBackButtonContainer>
            <EuiButtonEmpty
              iconType="arrowLeft"
              onClick={() => {
                history.goBack()
              }}
            >
              Back
            </EuiButtonEmpty>
            <EuiTitle size="xs">
              <h3>Create {resource?.name?.toLowerCase()}</h3>
            </EuiTitle>
          </TitleAndBackButtonContainer>
          <PublishAndSaveToDraftContainer>
            <EuiButton fill>Save as draft</EuiButton>
            <EuiButton iconType="check" fill color="secondary">
              Publish
            </EuiButton>
          </PublishAndSaveToDraftContainer>
        </DashboardLayout.Topbar>

        <DashboardLayout.Content>
          <PageWrapper>
            {/* <TextComponent /> */}
            {resource?.fields.map(field => {
              return <p>{JSON.stringify(field.component)}</p>
            })}
          </PageWrapper>
          <CreateResourceSidebar resource={resource} />
        </DashboardLayout.Content>
      </DashboardLayout.Body>
    </DashboardLayout>
  )
}

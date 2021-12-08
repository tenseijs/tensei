import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { EuiButton, EuiButtonEmpty } from '@tensei/eui/lib/components/button'
import { DashboardLayout } from '../../components/dashboard/layout'
import { useEffect } from 'react'
import { useResourceStore } from '../../../store/resource'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiText } from '@tensei/eui/lib/components/text'
import styled from 'styled-components'
import { EuiIcon } from '@tensei/eui/lib/components/icon'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer'
import {
  AbstractData,
  FieldContract,
  FormComponentProps,
  ResourceContract
} from '@tensei/components'
import { EuiAccordion } from '@tensei/eui/lib/components/accordion'
import { EuiHorizontalRule } from '@tensei/eui/lib/components/horizontal_rule'
import { EuiFormRow } from '@tensei/eui/lib/components/form'
import { EuiBadge } from '@tensei/eui/lib/components/badge'
import { useToastStore } from '../../../store/toast'
import { useForm } from '../../hooks/forms'

import { FieldGroup } from './field-group'

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
  height: 32px;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Heading = styled(EuiText)`
  font-weight: 500;
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

const LabelAppendWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
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
        <Heading size="xs">{title}</Heading>
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
  height: 100%;
  overflow-y: auto;
  padding: 40px;
`
const PageContent = styled.div`
  // width: 50%;
  width: 650px;
  margin: 0px auto;
`
const ResourceField = styled.div`
  margin-bottom: 25px;
`
const ResourceFieldComponent = styled.div`
  padding-bottom: 20px;
`

export const CreateResource: React.FunctionComponent = () => {
  // const theme = useEuiTheme()
  const { push, goBack } = useHistory()
  const [activeField, setActiveField] = useState<FieldContract>()
  const { findResource, createResource, resource } = useResourceStore()
  const { resource: resourceSlug } = useParams<{
    resource: string
  }>()
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToastStore()

  useEffect(() => {
    const found = findResource(resourceSlug)

    if (!found) {
      push(window.Tensei.getPath(''))
    }
  }, [resourceSlug])

  const { form, errors, submit, loading, setValue } = useForm<AbstractData>({
    defaultValues: {},
    onSubmit: createResource,
    onSuccess: () => {
      toast(
        'Created',
        <p>{resource?.name.toLowerCase()} have been created successfully</p>
      )

      push(window.Tensei.getPath(`resources/${resource?.slugPlural}`))
    }
  })

  if (!resource) {
    return <p>Loading ...</p> // show full page loader here.
  }

  return (
    <DashboardLayout>
      <DashboardLayout.Sidebar title="Content"></DashboardLayout.Sidebar>

      <DashboardLayout.Body>
        <DashboardLayout.Topbar>
          <TitleAndBackButtonContainer>
            <EuiButtonEmpty
              iconType="arrowLeft"
              onClick={() => {
                goBack()
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
            <EuiButton
              iconType="check"
              fill
              color="success"
              onClick={() => submit(undefined)}
              isLoading={loading}
            >
              Publish
            </EuiButton>
          </PublishAndSaveToDraftContainer>
        </DashboardLayout.Topbar>

        <DashboardLayout.Content>
          <PageWrapper>
            <PageContent>
              {resource?.fields.map(field => {
                if (field.showOnCreation == false) return

                const Component: React.FunctionComponent<
                  FormComponentProps & AbstractData
                > =
                  window.Tensei.components.form[field.component.form] ||
                  window.Tensei.components.form.Text

                let labelAppend = null

                if (
                  field.rules.includes('required') ||
                  field.creationRules.includes('required')
                ) {
                  labelAppend = (
                    <LabelAppendWrapper>
                      <EuiBadge color="default">Required</EuiBadge>
                      <EuiBadge color="default">Localized</EuiBadge>
                    </LabelAppendWrapper>
                  )
                }

                return (
                  <FieldGroup
                    key={field.inputName}
                    focused={activeField?.inputName === field.inputName}
                  >
                    <EuiFormRow
                      fullWidth
                      label={field.name}
                      helpText={field.description}
                      error={errors?.[field.inputName]}
                      isInvalid={!!errors?.[field.inputName]}
                      labelAppend={labelAppend}
                    >
                      <Component
                        form={form}
                        field={field}
                        resource={resource}
                        id={field.inputName}
                        name={field.inputName}
                        value={form[field.inputName]}
                        editing={isEditing}
                        values={form[field.inputName]}
                        errors={errors || {}}
                        onFocus={() => {
                          setActiveField(field)
                        }}
                        activeField={activeField}
                        error={errors?.[field.inputName] as string}
                        onChange={(value: any) => {
                          setValue(field.inputName, value)
                        }}
                      />
                    </EuiFormRow>
                  </FieldGroup>
                )
              })}
            </PageContent>
          </PageWrapper>
          <CreateResourceSidebar resource={resource} />
        </DashboardLayout.Content>
      </DashboardLayout.Body>
    </DashboardLayout>
  )
}

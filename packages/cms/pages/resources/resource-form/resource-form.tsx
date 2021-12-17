import React, { useState, useEffect } from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { EuiButton, EuiButtonEmpty } from '@tensei/eui/lib/components/button'
import { DashboardLayout } from '../../components/dashboard/layout'
import { useResourceStore } from '../../../store/resource'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiCopy } from '@tensei/eui/lib/components/copy'
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
import { EuiFormRow } from '@tensei/eui/lib/components/form'
import { EuiBadge } from '@tensei/eui/lib/components/badge'
import { useToastStore } from '../../../store/toast'
import { useForm } from '../../hooks/forms'

import { FieldGroup } from './field-group'
import moment from 'moment'
import { AxiosResponse } from 'axios'
import { useAuthStore } from '../../../store/auth'

const Sidebar = styled.div<{ close: boolean; inFlyout?: boolean }>`
  background-color: #fcfcfc;
  display: flex;
  flex-direction: column;
  width: ${({ close, inFlyout }) => (close ? '0' : inFlyout ? '25%' : '35%')};
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
  align-items: center;
  justify-content: space-between;
`

const BadgeInButton = styled(EuiBadge)`
  cursor: pointer;

  .euiBadge__content,
  .euiBadge__text {
    cursor: pointer;
  }
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

export const UpdateResourceSidebar: React.FunctionComponent<{
  resourceData: any
  isEditing?: boolean
  inFlyout?: boolean
  initialClose?: boolean
  resource: ResourceContract | undefined
}> = ({
  resource,
  resourceData,
  isEditing,
  inFlyout,
  initialClose = false
}) => {
  const [close, setClose] = useState(initialClose)
  const onCloseSideBar = () => setClose(!close)

  return (
    <Sidebar close={close} inFlyout={inFlyout}>
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
          <EuiText size="s">ID</EuiText>
          {isEditing ? (
            <EuiCopy textToCopy={resourceData?.id}>
              {copy => (
                <button onClick={copy}>
                  <BadgeInButton color="hollow">
                    {resourceData?.id}
                  </BadgeInButton>
                </button>
              )}
            </EuiCopy>
          ) : (
            <ValueText size="s">-</ValueText>
          )}
        </Content>
        <Content>
          <EuiText size="s">Created by</EuiText>
          <ValueText size="s">-</ValueText>
        </Content>
        <Content>
          <EuiText size="s">Last updated</EuiText>
          <ValueText size="s">
            {isEditing ? moment(resourceData?.updatedAt).fromNow() : '-'}
          </ValueText>
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

export function resolveDefaultFormValues(
  resource: ResourceContract,
  data: AbstractData,
  isEditing = false
) {
  const form: AbstractData = {}

  resource.fields
    .filter(field => {
      if (isEditing) {
        return field.showOnUpdate
      }

      return field.showOnCreation
    })
    .forEach(field => {
      form[field.inputName] = data[field.inputName] || field.defaultValue || ''
    })

  return form
}

export const ResourceFormWrapper: React.FunctionComponent = () => {
  const { findResource, fetchResourceData, resource } = useResourceStore()
  const { push } = useHistory()
  const { toast } = useToastStore()
  const [resourceData, setResourceData] = useState()
  const { resource: resourceSlug, id: resourceId = '' } = useParams<{
    resource: string
    id: string
  }>()
  const match = useRouteMatch()
  const isEditing =
    match.path === window.Tensei.getPath('resources/:resource/:id/edit')
  const { hasPermission } = useAuthStore()

  const getData = async (foundResource: ResourceContract) => {
    const [response, error] = await fetchResourceData(
      foundResource!,
      resourceId
    )

    if (response?.data?.data) {
      setResourceData(response?.data.data)
    }

    if (error) {
      toast(
        'Failed to load resource',
        'We could not find the resource to edit.'
      )

      window.Tensei.getPath(`/resources/${foundResource?.slugPlural}`)
    }
  }

  useEffect(() => {
    const found = findResource(resourceSlug)

    if (!found) {
      push(window.Tensei.getPath(''))

      return
    }

    if (isEditing) {
      if (!hasPermission(`create:${found?.slugPlural}`)) {
        push(window.Tensei.getPath(`resources/${found?.slugPlural}`))

        toast(
          'Unauthorized',
          <p>You're not authorized to edit {found?.name.toLowerCase()}</p>,
          'danger'
        )

        return
      }

      if (!resourceId) {
        push(window.Tensei.getPath(`resources/${found?.slugPlural}`))

        return
      }

      getData(found)
    } else {
      if (!hasPermission(`create:${found?.slugPlural}`)) {
        push(window.Tensei.getPath(`resources/${found?.slugPlural}`))

        toast(
          'Unauthorized',
          <p>You're not authorized to create {found?.name.toLowerCase()}</p>,
          'danger'
        )

        return
      }
    }
  }, [resourceSlug])

  if (!resource || (isEditing && !resourceData)) {
    return <p>Loading ...</p> // show full page loader here.
  }

  return (
    <ResourceFormView
      resource={resource}
      isEditing={isEditing}
      resourceData={resourceData}
    />
  )
}

export const ResourceFormView: React.FunctionComponent<{
  isEditing?: boolean
  resource: ResourceContract
  resourceData?: AbstractData
}> = ({ isEditing, resourceData = {}, resource }) => {
  const { goBack } = useHistory()

  const createResourceForm = useCreateResourceForm({
    isEditing,
    resource,
    resourceData,
    redirectOnSuccess: true
  })

  return (
    <>
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
            <h3>
              {isEditing ? 'Edit' : 'Create'} {resource?.name?.toLowerCase()}
            </h3>
          </EuiTitle>
        </TitleAndBackButtonContainer>
        <PublishAndSaveToDraftContainer>
          <EuiButton fill>Save as draft</EuiButton>
          <EuiButton
            iconType="check"
            fill
            color="success"
            isLoading={createResourceForm?.formData?.loading}
            onClick={() => createResourceForm?.formData?.submit(undefined)}
          >
            Publish
          </EuiButton>
        </PublishAndSaveToDraftContainer>
      </DashboardLayout.Topbar>
      <DashboardLayout.Content>
        <PageWrapper>
          <PageContent>
            {resource ? (
              <ResourceForm
                createResourceForm={createResourceForm}
                isEditing={isEditing}
              />
            ) : null}
          </PageContent>
        </PageWrapper>
        <UpdateResourceSidebar
          resource={resource}
          isEditing={isEditing}
          resourceData={resourceData}
        />
      </DashboardLayout.Content>
    </>
  )
}

export function useCreateResourceForm({
  resource,
  resourceData,
  isEditing,
  redirectOnSuccess,
  onSuccess
}: {
  resource: ResourceContract
  resourceData: AbstractData
  isEditing?: boolean
  redirectOnSuccess?: boolean
  onSuccess?: (response: AxiosResponse) => void
}) {
  const { push } = useHistory()
  const [activeField, setActiveField] = useState<FieldContract>()
  const { updateResource, createResource } = useResourceStore()
  const { id: resourceId = '' } = useParams<{
    resource: string
    id: string
  }>()

  const { toast } = useToastStore()

  const formData = useForm<AbstractData>({
    defaultValues: resolveDefaultFormValues(resource!, resourceData, isEditing),
    onSubmit: (form: AbstractData) =>
      isEditing
        ? updateResource(resource!, resourceId, form)
        : createResource(resource!, form),
    onSuccess: ({ response }) => {
      if (isEditing) {
        toast(
          'Updated',
          <p>{resource?.name.toLowerCase()} have been updated successfully</p>
        )
      } else {
        toast(
          'Created',
          <p>{resource?.name.toLowerCase()} have been created successfully</p>
        )
      }

      onSuccess?.(response)

      if (redirectOnSuccess) {
        push(window.Tensei.getPath(`resources/${resource?.slugPlural}`))
      }
    }
  })

  return {
    formData,
    activeField,
    setActiveField,
    resourceId,
    resource
  }
}

export const ResourceForm: React.FunctionComponent<{
  isEditing?: boolean
  createResourceForm: ReturnType<typeof useCreateResourceForm>
}> = ({ isEditing, createResourceForm }) => {
  const {
    formData: { form, errors, setValue },
    activeField,
    setActiveField,
    resource,
    resourceId
  } = createResourceForm

  const resourceFields = resource?.fields.filter(field =>
    isEditing ? field.showOnUpdate : field.showOnCreation
  )

  const relationshipFields = resourceFields.filter(
    field => field.isRelationshipField
  )

  const regularFields = resourceFields.filter(
    field => !field.isRelationshipField
  )

  return (
    <>
      {[...regularFields, ...relationshipFields].map(field => {
        const Component: React.FunctionComponent<
          FormComponentProps & AbstractData
        > =
          window.Tensei.components.form[field.component.form] ||
          window.Tensei.components.form.Text

        let labelAppend = null

        if (
          field.rules.includes('required') ||
          (isEditing
            ? field.updateRules.includes('required')
            : field.creationRules.includes('required'))
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
              label={field.label || field.name}
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
                values={form}
                errors={errors || {}}
                onFocus={() => {
                  setActiveField(field)
                }}
                editing={isEditing}
                editingId={resourceId}
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
    </>
  )
}

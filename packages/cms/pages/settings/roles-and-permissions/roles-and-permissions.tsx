import React, { FunctionComponent, useEffect, useMemo, useState } from 'react'

import { EuiBasicTable } from '@tensei/eui/lib/components/basic_table'
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiFlyoutFooter
} from '@tensei/eui/lib/components/flyout'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { useGeneratedHtmlId } from '@tensei/eui/lib/services/accessibility'
import { EuiButton, EuiButtonEmpty } from '@tensei/eui/lib/components/button'
import { EuiFieldText, EuiTextArea } from '@tensei/eui/lib/components/form'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiFormLabel } from '@tensei/eui/lib/components/form'
import { EuiFlexItem, EuiFlexGroup } from '@tensei/eui/lib/components/flex'
import {
  EuiSwitch,
  EuiForm,
  EuiFormRow
} from '@tensei/eui/lib/components/form/'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer/'
import styled from 'styled-components'
import { ResourceContract } from '@tensei/components'
import slugify from 'speakingurl'
import { useForm } from '../../hooks/forms'
interface CreateRoleForm {
  name: string
  description: string
  slug: string
  adminPermissions: number[]
}

interface AdminPermission {
  id: number
  name: string
  slug: string
}

interface CreateRoleFormProps {
  createRoleForm: CreateRoleForm
  setCreateRoleForm: (form: CreateRoleForm) => void
  fetchAdminRoles: () => void
  loading?: boolean
  errors?: any
  submit?: () => void
}

const RolesAndPermissionWrapper = styled.div`
  padding: 20px 40px 0 40px;
`
const TableHeading = styled.div`
  display: flex;
  justify-content: space-between;
  padding-left: 7px;
`
const AccordionWrapper = styled.div`
  margin-bottom: 20px;
`
const AccordionHeader = styled.div`
  height: 46px;
  width: 100%;
  padding: 0px 16px;
  border: 1px solid #c9d3db;
  background-color: #f5f7f9;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const Accordionbody = styled.div``
const AccordionItem = styled.div<{
  isLast?: boolean
}>`
  border-left: 0.4px solid #c9d3db;
  border-right: 0.4px solid #c9d3db;
  border-bottom: 0.4px solid #c9d3db;
  height: 46px;

  display: flex;
  align-items: center;
  padding: 0 28px;
  ${({ isLast }) =>
    isLast
      ? `
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  `
      : ``}
`

interface PermissionProps {
  isLast?: boolean
  permission: string
  checked?: boolean
  resource: ResourceContract
  allPermissions: AdminPermission[]
  createRoleForm: CreateRoleFormProps
}

const Switch: React.FC<{
  onChange?: (value: boolean) => void
  checked?: boolean
}> = ({ onChange, checked }) => {
  return (
    <EuiSwitch
      label="enable"
      showLabel={false}
      checked={!!checked}
      onChange={() => {
        onChange?.(!checked)
      }}
    />
  )
}

const AccordionPermissions: React.FC<PermissionProps> = ({
  permission: action,
  resource,
  isLast,
  checked,
  allPermissions,
  createRoleForm: { createRoleForm, setCreateRoleForm }
}) => {
  function onSwitchChange() {
    const selectedPermission = allPermissions.find(
      permission =>
        permission.slug === `${action.toLowerCase()}:${resource.slug}`
    )

    if (!selectedPermission) {
      return
    }

    if (createRoleForm.adminPermissions.includes(selectedPermission.id)) {
      setCreateRoleForm({
        ...createRoleForm,
        adminPermissions: createRoleForm.adminPermissions.filter(
          permission => permission !== selectedPermission?.id
        )
      })
    } else {
      setCreateRoleForm({
        ...createRoleForm,
        adminPermissions: [
          ...createRoleForm.adminPermissions,
          selectedPermission.id
        ]
      })
    }
  }

  return (
    <AccordionItem isLast={isLast}>
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiText size="s">Can {action}</EuiText>
        <Switch onChange={onSwitchChange} checked={checked} />
      </EuiFlexGroup>
    </AccordionItem>
  )
}

const FlyoutAccordion: React.FC<{
  createRoleForm: CreateRoleFormProps
  allPermissions: AdminPermission[]
}> = ({ createRoleForm, allPermissions }) => {
  const resources = window.Tensei.state.resources

  return (
    <>
      {resources.map(resource => {
        const resourcePermissions = [
          `create:${resource.slug}`,
          `index:${resource.slug}`,
          `update:${resource.slug}`,
          `delete:${resource.slug}`
        ]
        const resourcePermissionsIds = resourcePermissions.map(
          permissionSlug =>
            allPermissions.find(p => p.slug === permissionSlug)!.id
        )

        const checked = resourcePermissionsIds.every(p =>
          createRoleForm.createRoleForm.adminPermissions.includes(p)
        )

        return (
          <AccordionWrapper key={resource.slug}>
            <AccordionHeader>
              {resource.name}

              <Switch
                onChange={function () {
                  createRoleForm.setCreateRoleForm({
                    ...createRoleForm.createRoleForm,
                    adminPermissions: checked
                      ? Array.from(
                          new Set(
                            createRoleForm.createRoleForm.adminPermissions.filter(
                              permission =>
                                !resourcePermissionsIds.includes(permission)
                            )
                          )
                        )
                      : Array.from(
                          new Set([
                            ...createRoleForm.createRoleForm.adminPermissions,
                            ...resourcePermissionsIds
                          ])
                        )
                  })
                }}
                checked={checked}
              />
            </AccordionHeader>
            <Accordionbody>
              {['Create', 'Index', 'Update', 'Delete'].map(
                (permission, idx) => (
                  <AccordionPermissions
                    isLast={idx === 3}
                    resource={resource}
                    permission={permission}
                    allPermissions={allPermissions}
                    createRoleForm={createRoleForm}
                    key={`${permission}-${resource.name}`}
                    checked={createRoleForm.createRoleForm.adminPermissions.includes(
                      resourcePermissionsIds[idx]
                    )}
                  />
                )
              )}
            </Accordionbody>
          </AccordionWrapper>
        )
      })}
    </>
  )
}

type FormErrors = {}

const RolesFlyout: React.FC<{
  setIsFlyoutOpen: (open: boolean) => void
  createRoleForm: CreateRoleFormProps
  allPermissions: AdminPermission[]
}> = ({
  setIsFlyoutOpen,
  createRoleForm: {
    createRoleForm,
    setCreateRoleForm,
    fetchAdminRoles,
    loading,
    errors,
    submit
  },
  allPermissions
}) => {
  const flyoutHeadingId = useGeneratedHtmlId()

  const closeFlyout = () => {
    setIsFlyoutOpen(false)
  }

  return (
    <EuiFlyout onClose={closeFlyout}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}> Create custom role </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form">
          <EuiFormRow
            label="Name"
            error={errors?.name}
            isInvalid={!!errors?.name}
            fullWidth
          >
            <EuiFieldText
              onChange={event => {
                setCreateRoleForm({
                  ...createRoleForm,
                  name: event.target.value,
                  slug: slugify(event.target.value)
                })
              }}
              name="name"
              isInvalid={!!errors?.name}
              fullWidth
            />
          </EuiFormRow>

          <EuiFormRow
            label="Description"
            fullWidth
            error={errors?.description}
            isInvalid={!!errors?.description}
          >
            <EuiTextArea
              name="description"
              onChange={event => {
                setCreateRoleForm({
                  ...createRoleForm,
                  description: event.target.value
                })
              }}
              rows={2}
              isInvalid={!!errors?.description}
              fullWidth
            />
          </EuiFormRow>
          <EuiSpacer size="xl" />
          <EuiFormRow
            label="Role permissions"
            helpText="Select the permissions users with this role will have."
          >
            <p></p>
          </EuiFormRow>
          <EuiSpacer size="xl" />
          <FlyoutAccordion
            createRoleForm={{
              createRoleForm,
              setCreateRoleForm,
              fetchAdminRoles
            }}
            allPermissions={allPermissions}
          />
        </EuiForm>
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="cross" flush="left" onClick={closeFlyout}>
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              onClick={() => {
                submit?.()
              }}
              isLoading={loading}
              fill
            >
              Create Role
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  )
}

const RolesTable: React.FC = () => {
  const form = useForm<CreateRoleForm>({
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      adminPermissions: []
    },
    onSuccess() {},
    onSubmit(form) {
      return window.Tensei.api.post('admin-roles', form)
    }
  })

  const [allPermissions, setAllPermissions] = useState<AdminPermission[]>([])
  const [adminRoles, setAdminRoles] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)

  const columns = [
    {
      field: 'role',
      name: 'Role '
    },
    {
      field: 'members',
      name: 'Members'
    }
  ]

  const fetchAdminRoles = async () => {
    const [response] = await window.Tensei.api.get('admin-roles')

    setAdminRoles(response?.data.data)

    setLoading(false)
  }
  useEffect(() => {
    fetchAdminRoles()
  }, [])

  async function fetchPermissions() {
    const [response] = await window.Tensei.api.get<{
      data: AdminPermission[]
    }>('admin-permissions')
    if (response !== null) {
      setAllPermissions(response.data.data)
      form.setValue(
        'adminPermissions',
        response.data.data.map(permission => permission.id)
      )
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [])

  const renderedItems = adminRoles.map((item: any) => {
    const numberOfMembers = adminRoles.filter(
      (memberItem: any) => item.name === memberItem.name
    )
    const member = numberOfMembers.length > 1 ? 'members' : 'member'
    return {
      ...item,
      role: item.name,
      members: `${numberOfMembers.length} ${member}`
    }
  })

  return (
    <>
      <TableHeading>
        <EuiTitle>
          <h1>
            {adminRoles.length > 1
              ? `${adminRoles.length} existing roles`
              : adminRoles.length === 1
              ? `1 existing role`
              : `No roles`}
          </h1>
        </EuiTitle>
        <EuiButtonEmpty
          onClick={() => {
            setIsFlyoutOpen(true)
          }}
        >
          Create a new role
        </EuiButtonEmpty>
      </TableHeading>
      {isFlyoutOpen ? (
        <RolesFlyout
          setIsFlyoutOpen={setIsFlyoutOpen}
          allPermissions={allPermissions}
          createRoleForm={{
            createRoleForm: form.form,
            setCreateRoleForm: form.setForm,
            fetchAdminRoles,
            loading: form.loading,
            errors: form.errors,
            submit: form.submit
          }}
        />
      ) : null}
      <EuiBasicTable
        items={renderedItems}
        columns={columns}
        loading={loading}
      />
    </>
  )
}

const RolesAndPermissions: FunctionComponent = () => {
  return (
    <RolesAndPermissionWrapper>
      <RolesTable />
    </RolesAndPermissionWrapper>
  )
}

export default RolesAndPermissions

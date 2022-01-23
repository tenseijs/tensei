import React, { FunctionComponent, useEffect, useState } from 'react'
import { EuiBasicTable } from '@tensei/eui/lib/components/basic_table'
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiFlyoutFooter
} from '@tensei/eui/lib/components/flyout'
import { EuiConfirmModal } from '@tensei/eui/lib/components/modal/confirm_modal'
import { EuiCallOut } from '@tensei/eui/lib/components/call_out/call_out'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { useGeneratedHtmlId } from '@tensei/eui/lib/services/accessibility'
import { EuiButton, EuiButtonEmpty } from '@tensei/eui/lib/components/button'
import { EuiFieldText, EuiTextArea } from '@tensei/eui/lib/components/form'
import { EuiText } from '@tensei/eui/lib/components/text'
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
import { useToastStore } from '../../../store/toast'
import { useAdminUsersStore } from '../../../store/admin-users'
import { useAuthStore } from '../../../store/auth'

interface CreateRoleForm {
  name: string
  description: string
  slug: string
  adminPermissions: number[]
  id?: number
}

interface AdminPermission {
  id: number
  name: string
  slug: string
}

interface CreateRoleFormProps {
  createRoleForm: CreateRoleForm
  setCreateRoleForm: (form: CreateRoleForm) => void
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
  permission: { name: string; slug: string }
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
      permission => permission.slug === action.slug
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
        <EuiText size="s">Can {action.name}</EuiText>
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
        const resourcePermissions = resource.permissions

        const resourcePermissionsIds: number[] = resourcePermissions.map(
          permission => allPermissions.find(p => p.slug === permission.slug)!.id
        )

        const checked = resourcePermissionsIds.every(p =>
          createRoleForm.createRoleForm.adminPermissions.includes(p)
        )

        if (resource.permissions.length === 0) {
          return null
        }

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
              {resource.permissions.map((permission, idx) => (
                <AccordionPermissions
                  isLast={idx === 3}
                  resource={resource}
                  permission={permission}
                  allPermissions={allPermissions}
                  createRoleForm={createRoleForm}
                  key={`${permission.slug}-${resource.name}`}
                  checked={createRoleForm.createRoleForm.adminPermissions.includes(
                    resourcePermissionsIds[idx]
                  )}
                />
              ))}
            </Accordionbody>
          </AccordionWrapper>
        )
      })}
    </>
  )
}

const getPermissionIDs = (permissions: AdminPermission[]) => {
  return permissions.map((permission: AdminPermission) => permission.id)
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
    loading,
    errors,
    submit
  },
  allPermissions
}) => {
  const flyoutHeadingId = useGeneratedHtmlId()
  const { toast } = useToastStore()

  const closeFlyout = () => {
    setIsFlyoutOpen(false)
    setCreateRoleForm({
      ...createRoleForm,
      id: undefined,
      adminPermissions: getPermissionIDs(allPermissions)
    })
  }

  return (
    <EuiFlyout onClose={closeFlyout}>
      <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
        <EuiTitle>
          <h2 id={flyoutHeadingId}>
            {createRoleForm.id
              ? `Editing ${createRoleForm.name} role`
              : 'Create custom role'}
          </h2>
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
              defaultValue={createRoleForm.name}
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
              defaultValue={createRoleForm.description}
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
              setCreateRoleForm
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
              onClick={async () => {
                loading = true
                submit?.()
                {
                  createRoleForm.id
                    ? toast('Updated.', <p>Role updated successfully.</p>)
                    : toast('Created.', <p>Role created successfully.</p>)
                }
                loading = false
                closeFlyout()
              }}
              isLoading={loading}
              fill
            >
              {createRoleForm.id ? 'Update Role' : 'Create Role'}
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
    onSuccess() {
      fetchAdminRoles()
    },
    onSubmit(form) {
      {
        return form.id
          ? window.Tensei.api.patch(`admin-roles/${form.id}`, form)
          : window.Tensei.api.post('admin-roles', form)
      }
    }
  })

  const [allPermissions, setAllPermissions] = useState<AdminPermission[]>([])
  const [adminRoles, setAdminRoles] = useState<any>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const { getAdminUsers, getAdminRoles, removeRole } = useAdminUsersStore()
  const [isRemoveRoleModalVisible, setIsRemoveRoleModalVisible] = useState(
    false
  )
  const { toast } = useToastStore()
  const { hasPermission } = useAuthStore()

  const columns = [
    {
      field: 'role',
      name: 'Role '
    },
    {
      field: 'members',
      name: 'Members'
    },
    {
      field: 'actions',
      name: 'Actions',
      actions: [
        {
          name: 'Edit',
          description: 'Edit role',
          icon: 'pencil',
          type: 'icon',
          onClick: (role: any) => {
            if (!hasPermission(`update:admin-roles`)) {
              toast(
                'Unauthorized',
                <p>You're not authorized to update Roles & Permissions</p>,
                'danger'
              )

              return
            }

            form.setForm({
              id: role?.id,
              name: role?.name,
              description: role?.description,
              slug: role?.slug,
              adminPermissions: getPermissionIDs(role?.adminPermissions)
            })
            setIsFlyoutOpen(true)
          }
        },
        {
          name: 'Delete',
          description: 'Remove role',
          icon: 'trash',
          color: 'danger',
          type: 'icon',
          onClick: (role: any) => {
            if (!hasPermission(`delete:admin-roles`)) {
              toast(
                'Unauthorized',
                <p>You're not authorized to delete Roles & Permissions</p>,
                'danger'
              )

              return
            }

            if (role?.slug === 'super-admin') {
              toast(undefined, "Can't remove Super Admin", 'danger')
              return
            }
            form.setForm({
              id: role?.id,
              name: role?.name,
              description: role?.description,
              slug: role?.slug,
              adminPermissions: getPermissionIDs(role?.adminPermissions)
            })
            setIsRemoveRoleModalVisible(true)
          }
        }
      ]
    }
  ]

  const getTeamMembers = async () => {
    const [response] = await getAdminUsers()
    setTeamMembers(response?.data.data ?? [])
  }

  const fetchAdminRoles = async () => {
    const [response] = await getAdminRoles()
    setAdminRoles(response?.data.data)
    setLoading(false)
  }

  useEffect(() => {
    getTeamMembers()
    fetchAdminRoles()
  }, [])

  async function fetchPermissions() {
    const [response] = await window.Tensei.api.get<{
      data: AdminPermission[]
    }>('admin-permissions')
    if (response !== null) {
      setAllPermissions(response.data.data)
      form.setValue('adminPermissions', getPermissionIDs(response.data.data))
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [])

  const renderedItems = adminRoles.map((item: any) => {
    let numberOfMembers = 0
    teamMembers.forEach(member => {
      member?.adminRoles.forEach((role: any) => {
        numberOfMembers =
          role.slug === item.slug ? numberOfMembers + 1 : numberOfMembers
      })
    })
    const member =
      numberOfMembers > 0
        ? numberOfMembers > 1
          ? `${numberOfMembers} members`
          : `${numberOfMembers} member`
        : '-'
    return {
      ...item,
      role: item.name,
      members: member
    }
  })

  let removeRoleModal
  if (isRemoveRoleModalVisible) {
    removeRoleModal = (
      <EuiConfirmModal
        title="Remove role"
        onCancel={() => {
          setIsRemoveRoleModalVisible(false)
        }}
        onConfirm={async () => {
          setIsRemoveRoleModalVisible(false)
          const [, error] = await removeRole(form.form.id!)
          if (!error) {
            toast('Removed.', <p>Role removed successfully.</p>)
            await fetchAdminRoles()
          }
        }}
        cancelButtonText="Cancel"
        confirmButtonText="Remove"
        defaultFocusedButton="confirm"
        buttonColor="danger"
      >
        <p>Are you sure you want to remove this role?</p>
        <EuiCallOut
          size="s"
          title="Once done, this action cannot be undone"
          color="warning"
          iconType="alert"
        />
      </EuiConfirmModal>
    )
  }

  return (
    <>
      <TableHeading>
        <EuiTitle>
          <h1>
            All roles (
            {hasPermission('index:admin-roles') ? adminRoles.length : 0})
          </h1>
        </EuiTitle>
        <EuiButtonEmpty
          onClick={() => {
            setIsFlyoutOpen(true)
            form.setForm({
              name: '',
              description: '',
              slug: '',
              adminPermissions: getPermissionIDs(allPermissions)
            })
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
            loading: form.loading,
            errors: form.errors,
            submit: form.submit
          }}
        />
      ) : null}
      {removeRoleModal}
      {!hasPermission('index:admin-roles') ? null : (
        <EuiBasicTable
          items={renderedItems}
          columns={columns}
          loading={loading}
          hasActions={true}
        />
      )}
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

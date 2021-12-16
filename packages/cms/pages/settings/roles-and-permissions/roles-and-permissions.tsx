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
import { EuiFlexItem, EuiFlexGroup } from '@tensei/eui/lib/components/flex'
import {
  EuiSwitch,
  EuiForm,
  EuiFormRow
} from '@tensei/eui/lib/components/form/'
import { EuiSpacer } from '@tensei/eui/lib/components/spacer/'
import styled from 'styled-components'
import { ResourceContract } from '@tensei/components'

interface CreateRoleForm {
  name: string
  description: string
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
  padding: 16px 14px;
  border: 1px solid #c9d3db;
  background-color: #f5f7f9;
  border-radius: 6px;
`
const Accordionbody = styled.div``
const AccordionItem = styled.div`
  padding: 20px 20px;
  border-left: 0.4px solid #c9d3db;
  border-right: 0.4px solid #c9d3db;
  border-bottom: 0.4px solid #c9d3db;
  height: 46px;
`

interface PermissionProps {
  permission: string
  resource: ResourceContract
  allPermissions: AdminPermission[]
  createRoleForm: CreateRoleFormProps
}

const Switch: React.FC<{
  onChange?: (value: boolean) => void
}> = ({ onChange }) => {
  const [checked, setChecked] = useState(false)

  return (
    <EuiSwitch
      label="enable"
      showLabel={false}
      checked={checked}
      onChange={() => {
        setChecked(!checked)
        onChange?.(!checked)
      }}
    />
  )
}

const AccordionPermissions: React.FC<PermissionProps> = ({
  permission: action,
  resource,
  allPermissions,
  createRoleForm: { createRoleForm, setCreateRoleForm }
}) => {
  function onSwitchChange(checked: boolean) {
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
    <AccordionItem>
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiText size="s">Can {action}</EuiText>
        <Switch onChange={onSwitchChange} />
      </EuiFlexGroup>
    </AccordionItem>
  )
}

const FlyoutAccordion: React.FC<{
  createRoleForm: CreateRoleFormProps
  allPermissions: AdminPermission[]
}> = ({ createRoleForm, allPermissions }) => {
  const resources = window.Tensei.state.resources
  const [selectedPermission, setSelectedPermission] = useState<any>([])

  return (
    <>
      {resources.map(resource => (
        <AccordionWrapper>
          <AccordionHeader>{resource.name}</AccordionHeader>
          <Accordionbody>
            {['Create', 'Index', 'Update', 'Delete'].map(permission => (
              <>
                <AccordionPermissions
                  resource={resource}
                  permission={permission}
                  allPermissions={allPermissions}
                  createRoleForm={createRoleForm}
                />
              </>
            ))}
          </Accordionbody>
        </AccordionWrapper>
      ))}
    </>
  )
}

const RolesFlyout: React.FC<{
  setIsFlyoutOpen: (open: boolean) => void
  createRoleForm: CreateRoleFormProps
  allPermissions: AdminPermission[]
}> = ({
  setIsFlyoutOpen,
  createRoleForm: { createRoleForm, setCreateRoleForm },
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
          <EuiFormRow label="Role Name" fullWidth>
            <EuiFieldText
              onChange={event =>
                setCreateRoleForm({
                  ...createRoleForm,
                  name: event.target.value
                })
              }
              name="rolename"
              fullWidth
            />
          </EuiFormRow>

          <EuiFormRow label="Description" fullWidth>
            <EuiTextArea
              onChange={event =>
                setCreateRoleForm({
                  ...createRoleForm,
                  description: event.target.value
                })
              }
              fullWidth
            />
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
            <EuiButton onClick={closeFlyout} fill>
              Create Role
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  )
}

const RolesTable: React.FC = () => {
  const [createRoleForm, setCreateRoleForm] = useState<CreateRoleForm>({
    name: '',
    description: '',
    adminPermissions: []
  })
  const [allPermissions, setAllPermissions] = useState<AdminPermission[]>([])
  const [adminRoles, setAdminRoles] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)

  const columns = [
    {
      field: 'role',
      name: 'role '
    },
    {
      field: 'members',
      name: 'members'
    }
  ]

  useEffect(() => {
    const fetchAdminRoles = async () => {
      const [response] = await window.Tensei.api.get('admin-roles')

      setAdminRoles(response?.data.data)

      setLoading(false)
    }
    fetchAdminRoles()
  }, [])

  async function fetchPermissions() {
    const [response] = await window.Tensei.api.get<{
      data: AdminPermission[]
    }>('admin-permissions')
    if (response !== null) {
      setAllPermissions(response.data.data)
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
        <div>
          {adminRoles.length > 1
            ? `${adminRoles.length} existing roles`
            : adminRoles.length === 1
            ? `1 existing role`
            : `No roles`}
        </div>
        <EuiButton onClick={() => setIsFlyoutOpen(true)}>
          create a new role
        </EuiButton>
      </TableHeading>
      {isFlyoutOpen ? (
        <RolesFlyout
          setIsFlyoutOpen={setIsFlyoutOpen}
          allPermissions={allPermissions}
          createRoleForm={{
            createRoleForm,
            setCreateRoleForm
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

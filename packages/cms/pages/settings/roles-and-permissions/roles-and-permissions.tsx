import React, { FunctionComponent, useEffect, useState } from 'react'

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
  resource: any
}

const FlyoutAccordion: React.FC = () => {
  const resources = window.Tensei.state.resources
  const [selectedPermission, setSelectedPermission] = useState<any>([])

  const AccordionPermissions: React.FC<PermissionProps> = ({
    permission,
    resource
  }) => {
    return (
      <AccordionItem>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiText size="s">Can {permission}</EuiText>
          <Switch />
        </EuiFlexGroup>
      </AccordionItem>
    )
  }

  const Switch: React.FC = () => {
    const [checked, setChecked] = useState(false)

    return (
      <EuiSwitch
        label="enable"
        showLabel={false}
        checked={checked}
        onChange={() => {
          setChecked(!checked)
        }}
      />
    )
  }
  return (
    <>
      {resources.map(resource => (
        <AccordionWrapper>
          <AccordionHeader>{resource.name}</AccordionHeader>
          <Accordionbody>
            <AccordionPermissions
              permission=" Create"
              resource={resource.name}
            />
            <AccordionPermissions permission="Index" resource={resource.name} />
            <AccordionPermissions
              permission="Update"
              resource={resource.name}
            />
            <AccordionPermissions
              permission="Delete"
              resource={resource.name}
            />
          </Accordionbody>
        </AccordionWrapper>
      ))}
    </>
  )
}
const RolesTable: React.FC = () => {
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
      const [data] = await window.Tensei.api.get('admin-roles')

      setAdminRoles(data?.data.data)

      setLoading(false)
    }
    fetchAdminRoles()
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

  const Switch = () => {
    const [checked, setChecked] = useState(true)
    return (
      <EuiSwitch
        label="Enable"
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
    )
  }

  const RolesFlyout: React.FC = () => {
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
              <EuiFieldText name="rolename" fullWidth />
            </EuiFormRow>

            <EuiFormRow label="Description" fullWidth>
              <EuiTextArea fullWidth />
            </EuiFormRow>
            <EuiSpacer size="xl" />
            <FlyoutAccordion />
          </EuiForm>
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                iconType="cross"
                flush="left"
                onClick={closeFlyout}
              >
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
      {isFlyoutOpen && <RolesFlyout />}
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

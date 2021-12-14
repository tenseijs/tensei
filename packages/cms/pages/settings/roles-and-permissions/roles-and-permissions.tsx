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
import { EuiButton } from '@tensei/eui/lib/components/button'
import { EuiFieldText, EuiTextArea } from '@tensei/eui/lib/components/form'
import { EuiText } from '@tensei/eui/lib/components/text'
import { EuiFlexItem, EuiFlexGroup } from '@tensei/eui/lib/components/flex'
import { EuiSwitch } from '@tensei/eui/lib/components/form/'
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
  border-radius: 3px;
`
const Accordionbody = styled.div``
const AccordionItem = styled.div`
  padding: 20px 20px;
  border-left: 0.4px solid #c9d3db;
  border-right: 0.4px solid #c9d3db;
  border-bottom: 0.4px solid #c9d3db;
  height: 46px;
`
const Switch = () => {
  const [checked, setChecked] = useState(true)

  return (
    <EuiSwitch
      label=""
      checked={checked}
      onChange={() => setChecked(!checked)}
    />
  )
}

const FlyoutAccordion: React.FC = () => {
  const [adminRoles, setAdminRoles] = useState<any[]>([])
  useEffect(() => {
    const fetchAdminRoles = async () => {
      const [result] = await window.Tensei.api.get('admin-roles')
      setAdminRoles(result?.data.data[0].adminPermissions)
    }

    fetchAdminRoles()
  }, [])

  const resources = window.Tensei.state.resources
  return (
    <>
      {resources.map(resource => (
        <AccordionWrapper>
          <AccordionHeader>{resource.name}</AccordionHeader>
          <Accordionbody>
            {adminRoles.map(
              role =>
                role.slug.split(':')[1] ===
                  resource.namePlural.toLowerCase() && (
                  <AccordionItem>
                    <EuiFlexGroup justifyContent="spaceBetween">
                      <EuiText size="s">Can {role.name}</EuiText>
                      <Switch />
                    </EuiFlexGroup>
                  </AccordionItem>
                )
            )}
          </Accordionbody>
        </AccordionWrapper>
      ))}
    </>
  )
}
const RolesTable: React.FC = () => {
  const [items, setItems] = useState<any>([])
  const [memberNo, setMemberNo] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)

  const columns = [
    {
      field: 'Role',
      name: 'Role '
    },
    {
      field: 'Members',
      name: 'Members'
    }
  ]

  useEffect(() => {
    const fetchAdminRoles = async () => {
      const [data] = await window.Tensei.api.get('admin-roles')
      const [result] = await window.Tensei.api.get(
        'admin-roles?populate=adminUsers'
      )
      console.log(result)
      setItems(data?.data.data)
      setMemberNo(result?.data.data)
      setLoading(false)
    }
    fetchAdminRoles()
  }, [])

  const renderedItems = items.map((item: any) => {
    const numberOfMembers = memberNo?.filter(
      (memberItem: any) => item.name === memberItem.name
    )
    const member = numberOfMembers.length > 1 ? 'members' : 'member'
    return {
      ...item,
      Role: item.name,
      Members: `${numberOfMembers.length} ${member}`
    }
  })

  const Switch = () => {
    const [checked, setChecked] = useState(true)
    return (
      <EuiSwitch
        label="Enable"
        checked={checked}
        onChange={e => setChecked(!checked)}
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
          <EuiText size="s">Role Name</EuiText>
          <EuiFieldText />
          <EuiText>Description</EuiText>
          <EuiTextArea />
          <EuiSpacer size="xl" />
          <FlyoutAccordion />
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton iconType="cross" onClick={closeFlyout}>
                Cancel
              </EuiButton>
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
          {items.length > 1
            ? `${items.length} existing roles`
            : items.length === 1
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

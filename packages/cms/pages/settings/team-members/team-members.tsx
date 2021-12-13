import styled from 'styled-components'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'

import { useToastStore } from '../../../store/toast'
import { useAdminUsersStore } from '../../../store/admin-users'
import { useEffect } from 'react'
import { EuiButtonEmpty } from '@tensei/eui/lib/components/button'
import {
  EuiBasicTable,
  EuiBasicTableColumn
} from '@tensei/eui/lib/components/basic_table'
import { EuiBadge } from '@tensei/eui/lib/components/badge'
import moment from 'moment'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const PageWrapper = styled.div`
  width: 100%;
  padding: 40px;
  margin-bottom: 40px;
`

const TableMetaWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const OwnerBadge = styled.div`
  margin-left: 5px;
  border-radius: 3px;
  font-size: 12px;
  padding: 4px 12px;
  line-height: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primaryTransparent};
`
const InitialsAvatar = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  color: #ffffff;
  background-color: ${({ theme }) => theme.colors.accent};
  margin-right: 10px;
`
const UserWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`
const UserRole = styled.span`
  margin-right: 10px;
`

interface ProfileProps {}

export const TeamMembers: FunctionComponent<ProfileProps> = () => {
  const { toast } = useToastStore()
  const { getAdminUsers } = useAdminUsersStore()
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const getTeamMembers = useCallback(async () => {
    const [data, error] = await getAdminUsers()

    if (!error) {
      console.log(data?.data.data)
      setTeamMembers(data?.data.data)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    getTeamMembers()
  }, [])

  const columns: EuiBasicTableColumn<any>[] = useMemo(() => {
    return [
      {
        name: 'User',
        render: (item: any) => {
          return (
            <UserWrapper>
              <InitialsAvatar>
                {item.firstName.charAt(0)}
                {item.lastName.charAt(0)}
              </InitialsAvatar>
              <div>
                {item.firstName} {item.lastName}
              </div>
              {item.adminRoles.some(
                (role: any) => role.slug === 'super-admin'
              ) === true ? (
                <OwnerBadge>Owner</OwnerBadge>
              ) : (
                ''
              )}
            </UserWrapper>
          )
        }
      },
      {
        name: 'Role',
        render: (item: any) => {
          return item?.adminRoles.map((roles: any) => (
            <UserRole>{roles?.name}</UserRole>
          ))
        }
      },
      {
        name: 'Created At',
        render: (item: any) => {
          return moment(item.createdAt).format('D MMM YYYY')
        }
      },
      {
        name: 'Actions',
        actions: [
          {
            name: 'Edit',
            description: 'Edit this item',
            icon: 'pencil',
            type: 'icon',
            onClick: item => {}
          },
          {
            name: 'Delete',
            description: 'Delete this item',
            icon: 'trash',
            type: 'icon',
            color: 'danger',
            onClick: item => {}
          }
        ]
      }
    ]
  }, [])

  return (
    <PageWrapper>
      <Wrapper>
        <TableMetaWrapper>
          <h1>All members ({teamMembers.length})</h1>
          <EuiButtonEmpty iconType={'plus'}>Add team members</EuiButtonEmpty>
        </TableMetaWrapper>

        <EuiBasicTable
          tableCaption="Demo of EuiBasicTable"
          items={teamMembers}
          itemId={'id'}
          hasActions={true}
          loading={loading}
          columns={columns}
        />
      </Wrapper>
    </PageWrapper>
  )
}

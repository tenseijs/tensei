import styled from 'styled-components'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'

import { useToastStore } from '../../../store/toast'
import { TeamMemberProps, useAdminUsersStore } from '../../../store/admin-users'
import { useEffect } from 'react'
import { EuiButtonEmpty } from '@tensei/eui/lib/components/button'
import { EuiCallOut } from '@tensei/eui/lib/components/call_out/call_out'
import {
  EuiBasicTable,
  EuiBasicTableColumn
} from '@tensei/eui/lib/components/basic_table'
import moment from 'moment'
import { EuiAvatar } from '@tensei/eui/lib/components/avatar'
import { EuiConfirmModal } from '@tensei/eui/lib/components/modal/confirm_modal'

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
const AvatarWrapper = styled.div`
  margin-right: 10px;
  cursor: pointer;
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
  const { getAdminUsers, removeUser } = useAdminUsersStore()
  const [teamMembers, setTeamMembers] = useState<TeamMemberProps[]>([])
  const [loading, setLoading] = useState(true)

  const getTeamMembers = useCallback(async () => {
    const [data, error] = await getAdminUsers()

    if (!error) {
      console.log(data?.data.data)
      setTeamMembers(data?.data.data)
    }

    setLoading(false)
  }, [])

  const removeTeamMember = async () => {
    const [data, error] = await removeUser(selectedMember?.id as string)
    if (!error) {
      closeRemoveMemberModal()
      toast('Removed.', <p>Member removed successfully.</p>)
      getTeamMembers()
    }
  }

  const isOwner = (item: TeamMemberProps) => {
    return item.adminRoles.some((role: any) => role.slug === 'super-admin')
  }

  useEffect(() => {
    getTeamMembers()
  }, [])

  const [isRemoveMemberModalVisible, setIsRemoveMemberModalVisible] = useState(
    false
  )
  const [selectedMember, setSelectedMember] = useState<TeamMemberProps>()
  const closeRemoveMemberModal = () => setIsRemoveMemberModalVisible(false)
  const showRemoveMemberModal = () => setIsRemoveMemberModalVisible(true)

  const columns: EuiBasicTableColumn<any>[] = useMemo(() => {
    return [
      {
        name: 'User',
        render: (item: any) => {
          return (
            <UserWrapper>
              <AvatarWrapper>
                <EuiAvatar name={`${item.firstName} ${item.lastName}`} />
              </AvatarWrapper>
              <div>
                {item.firstName} {item.lastName}
              </div>
              {isOwner(item) ? <OwnerBadge>Owner</OwnerBadge> : ''}
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
            description: 'Change user role',
            icon: 'pencil',
            type: 'icon',
            onClick: item => {}
          },
          {
            name: 'Delete',
            description: 'Remove this user',
            icon: 'trash',
            type: 'icon',
            color: 'danger',
            onClick: item => {
              if (isOwner(item)) {
                toast(undefined, "Can't remove Owner", 'danger')
                return
              }
              setSelectedMember(item)
              showRemoveMemberModal()
            }
          }
        ]
      }
    ]
  }, [])

  let removeMemberModal

  if (isRemoveMemberModalVisible) {
    removeMemberModal = (
      <EuiConfirmModal
        title="Remove member"
        onCancel={closeRemoveMemberModal}
        onConfirm={removeTeamMember}
        cancelButtonText="Cancel"
        confirmButtonText="Remove"
        defaultFocusedButton="confirm"
        buttonColor="danger"
      >
        <p>Are you sure you want to remove this member?</p>
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
    <PageWrapper>
      <Wrapper>
        <TableMetaWrapper>
          <h1>All members ({teamMembers.length})</h1>
          <EuiButtonEmpty iconType={'plus'}>Add team members</EuiButtonEmpty>
        </TableMetaWrapper>

        <EuiBasicTable
          items={teamMembers}
          itemId={'id'}
          hasActions={true}
          loading={loading}
          columns={columns}
        />

        {removeMemberModal}
      </Wrapper>
    </PageWrapper>
  )
}

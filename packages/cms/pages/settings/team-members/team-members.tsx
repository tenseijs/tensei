import styled from 'styled-components'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'

import { useToastStore } from '../../../store/toast'
import { TeamMemberProps, useAdminUsersStore } from '../../../store/admin-users'
import { useEffect } from 'react'
import { EuiButton, EuiButtonEmpty } from '@tensei/eui/lib/components/button'
import { EuiCallOut } from '@tensei/eui/lib/components/call_out/call_out'
import {
  EuiBasicTable,
  EuiBasicTableColumn
} from '@tensei/eui/lib/components/basic_table'
import moment from 'moment'
import { EuiTitle } from '@tensei/eui/lib/components/title'
import { EuiAvatar } from '@tensei/eui/lib/components/avatar'
import { EuiConfirmModal } from '@tensei/eui/lib/components/modal/confirm_modal'
import {
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle
} from '@tensei/eui/lib/components/modal'
import { useGeneratedHtmlId } from '@tensei/eui/lib/services'
import {
  EuiCheckboxGroup,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiFieldPassword
} from '@tensei/eui/lib/components/form'
import { AxiosResponse, AxiosError } from 'axios'
import { EuiBadge } from '@tensei/eui/lib/components/badge'

import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter
} from '@tensei/eui/lib/components/flyout'
import { EuiFlexItem, EuiFlexGroup } from '@tensei/eui/lib/components/flex'
import { useForm } from '../../hooks/forms'
import { useAuthStore } from '../../../store/auth'
import { useHistory } from 'react-router-dom'
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
  margin-left: 2px;
  border-radius: 3px;
  font-size: 12px;
  padding: 4px 4px;
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
interface FlyOutProps {
  setisEditTeamMemberFlyoutVisible: (b: boolean) => void
  selectedMember: TeamMemberProps
  showChangeMemberRoleModal: () => void
  getTeamMembers: () => void
}
interface FormInput {
  firstName: string
  lastName: string
  password: string
}
const FlyOut: React.FC<FlyOutProps> = ({
  setisEditTeamMemberFlyoutVisible,
  selectedMember,
  showChangeMemberRoleModal,
  getTeamMembers
}) => {
  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: 'simpleFlyoutTitle'
  })
  const { form, errors, submit, loading, setValue } = useForm<FormInput>({
    defaultValues: {
      firstName: selectedMember.firstName,
      lastName: selectedMember.lastName,
      password: ''
    },
    onSubmit: (): Promise<[AxiosResponse | null, AxiosError | null]> => {
      return window.Tensei.api.patch(`admin-users/${selectedMember.id}`, form)
    },
    onSuccess: () => {
      toast('Edited.', <p>Member data edited successfully.</p>)
      setisEditTeamMemberFlyoutVisible(false)
      getTeamMembers()
    }
  })

  const { toast } = useToastStore()

  return (
    <EuiFlyout
      ownFocus
      onClose={() => setisEditTeamMemberFlyoutVisible(false)}
      aria-labelledby={simpleFlyoutTitleId}
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id={simpleFlyoutTitleId}>Edit Member</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form">
          <EuiFormRow label="Firstname" fullWidth>
            <EuiFieldText
              value={form.firstName}
              fullWidth
              onChange={event => {
                setValue('firstName', event.target.value)
              }}
            />
          </EuiFormRow>

          <EuiFormRow label="Lastname" fullWidth>
            <EuiFieldText
              fullWidth
              value={form.lastName}
              onChange={event => {
                setValue('lastName', event.target.value)
              }}
            />
          </EuiFormRow>
          <EuiFormRow label="Email" isDisabled fullWidth>
            <EuiFieldText name="email" value={selectedMember.email} fullWidth />
          </EuiFormRow>
          <EuiFormRow
            label="Password"
            fullWidth
            isInvalid={!!errors?.password}
            error={errors?.password}
          >
            <EuiFieldPassword
              name="password"
              value={form.password}
              isInvalid={!!errors?.password}
              fullWidth
              onChange={e => {
                setValue('password', e.target.value)
              }}
            />
          </EuiFormRow>

          <EuiButton
            onClick={() => {
              showChangeMemberRoleModal()
            }}
          >
            Change role
          </EuiButton>
        </EuiForm>
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              iconType="cross"
              flush="left"
              onClick={() => setisEditTeamMemberFlyoutVisible(false)}
            >
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              type="submit"
              isLoading={loading}
              onClick={() => submit()}
              fill
            >
              Submit
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  )
}

export const TeamMembers: FunctionComponent<ProfileProps> = () => {
  const { toast } = useToastStore()
  const {
    getAdminUsers,
    removeUser,
    getAdminRoles,
    updateUserRoles
  } = useAdminUsersStore()
  const [teamMembers, setTeamMembers] = useState<TeamMemberProps[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [
    isEditTeamMemberFlyoutVisible,
    setisEditTeamMemberFlyoutVisible
  ] = useState(false)
  const { hasPermission } = useAuthStore()

  const getTeamMembers = useCallback(async () => {
    const [data, error] = await getAdminUsers()

    if (!error) {
      setTeamMembers(data?.data.data)
    }
  }, [])

  const getRoles = useCallback(async () => {
    const [data, error] = await getAdminRoles()

    if (!error) {
      setRoles(data?.data.data)
    }
  }, [])

  const removeTeamMember = async () => {
    const [data, error] = await removeUser(selectedMember?.id as string)
    if (!error) {
      closeRemoveMemberModal()
      toast('Removed.', <p>Member removed successfully.</p>)
      getTeamMembers()
    } else {
      toast('Error.', <p>{error.message}.</p>, 'danger')
    }
  }

  const updateTeamMemberRole = async (roles: string[]) => {
    const [data, error] = await updateUserRoles(
      selectedMember?.id as string,
      roles
    )
    if (!error) {
      closeChangeMemberRoleModal()
      toast('Changed.', <p>Member role changed successfully.</p>)
      getTeamMembers()
    } else {
      toast('Error.', <p>{error.message}.</p>, 'danger')
    }
  }

  useEffect(() => {
    getTeamMembers()
    getRoles()
    setLoading(false)
  }, [])

  const isOwner = (item: TeamMemberProps) => {
    return item.adminRoles.some((role: any) => role.slug === 'super-admin')
  }

  const [selectedMember, setSelectedMember] = useState<TeamMemberProps>({
    id: '',
    firstName: '',
    lastName: '',
    password: '',
    email: '',
    active: true,
    adminRoles: [],
    createdAt: '',
    updatedAt: ''
  })

  const [isRemoveMemberModalVisible, setIsRemoveMemberModalVisible] = useState(
    false
  )
  const closeRemoveMemberModal = () => setIsRemoveMemberModalVisible(false)
  const showRemoveMemberModal = () => setIsRemoveMemberModalVisible(true)
  const [
    isChangeMemberRoleModalVisible,
    setChangeMemberRoleModalVisible
  ] = useState(false)
  const closeChangeMemberRoleModal = () =>
    setChangeMemberRoleModalVisible(false)
  const showChangeMemberRoleModal = () => setChangeMemberRoleModalVisible(true)
  const modalFormId = useGeneratedHtmlId({ prefix: 'modalForm' })
  const [
    rolesCheckboxSelectionMap,
    setRolesCheckboxSelectionMap
  ] = useState<any>({})
  const { push } = useHistory()

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
        name: 'Email',
        render: (item: any) => {
          return <EuiBadge>{item.email}</EuiBadge>
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
            onClick: (item: TeamMemberProps) => {
              if (!hasPermission(`update:admin-users`)) {
                toast(
                  'Unauthorized',
                  <p>You're not authorized to update Team members</p>,
                  'danger'
                )

                return
              }

              if (isOwner(item)) {
                toast(undefined, "Owner role can't be changed", 'danger')
                return
              }

              setisEditTeamMemberFlyoutVisible(true)
              setSelectedMember(item)
              // set rolesCheckboxSelectionMap
              setRolesCheckboxSelectionMap({})
              const rolesId = roles.map(role => role.id)
              const adminRolesId = item.adminRoles.map(role => role.id)
              const newCheckboxIdToSelectedMap: any = {}
              rolesId.forEach(
                roleId =>
                  (newCheckboxIdToSelectedMap[roleId] = adminRolesId.includes(
                    roleId
                  ))
              )
              setRolesCheckboxSelectionMap(newCheckboxIdToSelectedMap)
            }
          },
          {
            name: 'Delete',
            description: 'Remove this user',
            icon: 'trash',
            type: 'icon',
            color: 'danger',
            onClick: item => {
              if (!hasPermission(`delete:admin-users`)) {
                toast(
                  'Unauthorized',
                  <p>You're not authorized to delete Team members</p>,
                  'danger'
                )

                return
              }

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
  }, [roles])

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

  let changeMemberRoleModal

  let checkboxes = roles
    .filter(role => role.slug !== 'super-admin')
    .map(role => ({
      id: role.id.toString(),
      label: role.name
    }))

  if (isChangeMemberRoleModalVisible) {
    changeMemberRoleModal = (
      <EuiModal onClose={closeChangeMemberRoleModal}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <h1>Change role</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>

        <EuiModalBody>
          <EuiForm id={modalFormId} component="form">
            <EuiFormRow>
              <EuiCheckboxGroup
                options={checkboxes}
                idToSelectedMap={rolesCheckboxSelectionMap}
                onChange={id => {
                  const newCheckboxIdToSelectedMap = {
                    ...rolesCheckboxSelectionMap,
                    ...{
                      [id]: !rolesCheckboxSelectionMap[id]
                    }
                  }
                  setRolesCheckboxSelectionMap(newCheckboxIdToSelectedMap)
                }}
              />
            </EuiFormRow>
          </EuiForm>
        </EuiModalBody>

        <EuiModalFooter>
          <EuiButtonEmpty onClick={closeChangeMemberRoleModal}>
            Cancel
          </EuiButtonEmpty>

          <EuiButton
            type="submit"
            form={modalFormId}
            onClick={submitEvent => {
              submitEvent.preventDefault()
              let newAdminRoles: any[] = []
              Object.entries(rolesCheckboxSelectionMap).forEach(
                ([id, value]) => {
                  if (!value) return
                  newAdminRoles.push(id)
                }
              )
              updateTeamMemberRole(newAdminRoles)
            }}
            fill
          >
            Assign role
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    )
  }

  return (
    <PageWrapper>
      <Wrapper>
        {isEditTeamMemberFlyoutVisible && (
          <FlyOut
            setisEditTeamMemberFlyoutVisible={setisEditTeamMemberFlyoutVisible}
            showChangeMemberRoleModal={showChangeMemberRoleModal}
            selectedMember={selectedMember}
            getTeamMembers={getTeamMembers}
          />
        )}
        <TableMetaWrapper>
          <EuiTitle>
            <h1>
              All members (
              {hasPermission('index:admin-users') ? teamMembers.length : 0})
            </h1>
          </EuiTitle>
          {hasPermission('create:admin-users') && (
            <EuiButtonEmpty iconType={'plus'}>Add team members</EuiButtonEmpty>
          )}
        </TableMetaWrapper>

        {!hasPermission('index:admin-users') ? null : (
          <EuiBasicTable
            items={teamMembers}
            itemId={'id'}
            hasActions={true}
            loading={loading}
            columns={columns}
          />
        )}

        {removeMemberModal}
        {changeMemberRoleModal}
      </Wrapper>
    </PageWrapper>
  )
}

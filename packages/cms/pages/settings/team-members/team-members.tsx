import styled from 'styled-components'
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react'

import { useToastStore } from '../../../store/toast'
import { TeamMemberProps, useAdminUsersStore } from '../../../store/admin-users'
import { useEffect } from 'react'
import { EuiButton, EuiButtonEmpty } from '@tensei/eui/lib/components/button'
import { EuiCallOut } from '@tensei/eui/lib/components/call_out/call_out'
import { EuiCopy } from '@tensei/eui/lib/components/copy'
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
import { EuiSpacer } from '@tensei/eui/lib/components/spacer/'
import { EuiText } from '@tensei/eui/lib/components/text'
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter
} from '@tensei/eui/lib/components/flyout'
import { EuiFlexItem, EuiFlexGroup } from '@tensei/eui/lib/components/flex'
import { EuiSuperSelect } from '@tensei/eui/lib/components/form'
import { useForm } from '../../hooks/forms'
import { useAuthStore } from '../../../store/auth'
import { useHistory } from 'react-router-dom'
import { AbstractData } from '@tensei/components'
import { useSidebarStore } from '../../../store/sidebar'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  @media only screen and (max-width: 768px) {
    .euiTable.euiTable--responsive
      .euiTableRow.euiTableRow-isExpandable
      .euiTableRowCell--isExpander,
    .euiTable.euiTable--responsive
      .euiTableRow.euiTableRow-hasActions
      .euiTableRowCell--hasActions {
      top: 76px;
    }
  }
  @media only screen and (max-width: 712px) {
    h1 {
      font-size: 3.5vw;
    }
  }
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
  font-size: 10px;
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
  margin-right: 5px;
`

const ClipBoardCallOut = styled(EuiCallOut)`
  box-shadow: -5px 4px 4px 2px rgba(0, 0, 0, 0.3);
  border-left: 5px solid ${({ theme }) => theme.colors.primary};
  background-color: #ffffff;
  width: 600px;
  margin: 0 20px;
`

const ClipBoardButton = styled(EuiButtonEmpty)`
  inline-size: 550px;
  overflow-wrap: break-word;
`

interface ProfileProps {}
interface FlyOutProps {
  setisEditTeamMemberFlyoutVisible: (b: boolean) => void
  selectedMember: TeamMemberProps
  showChangeMemberRoleModal: () => void
  getTeamMembers: () => void
}
interface InviteFlyoutProps {
  setIsInviteMemberFlyout: (b: boolean) => void
  roles: any[]
  onInvite: () => void
}
interface FormInput {
  firstName: string
  lastName: string
  password: string
}
interface FormInputProps {
  firstName: string
  lastName: string
  email: string
  adminRoles: any[]
}

function CopyClipboard() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 2.729V2a1 1 0 011-1h2v1H3v12h4v1H3a1 1 0 01-1-1V2.729zM14 5V2a1 1 0 00-1-1h-2v1h2v3h1zm-1 1h2v9H8V6h5V5H8a1 1 0 00-1 1v9a1 1 0 001 1h7a1 1 0 001-1V6a1 1 0 00-1-1h-2v1z"
        fill="currentColor"
      />
    </svg>
  )
}

const InviteFlyout: React.FC<InviteFlyoutProps> = ({
  setIsInviteMemberFlyout,
  roles,
  onInvite
}) => {
  const [inviteCode, setInviteCode] = useState<string>('')

  const simpleFlyoutTitleId = useGeneratedHtmlId({
    prefix: 'simpleFlyoutTitle'
  })

  const { form, errors, loading, submit, setValue } = useForm<FormInputProps>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      adminRoles: []
    },
    onSubmit: async (form: AbstractData) => {
      const response = await window.Tensei.api.post('/auth/invite-member', form)

      const [data, error] = response
      console.log(data)
      if (!error) {
        setInviteCode(data?.data?.inviteCode)
      }
      return response
    }
  })

  const inviteUrl = `${window.Tensei.state.config.serverUrl}/${window.Tensei.state.config.dashboardPath}/auth/register/${inviteCode}`

  const options = roles.map(role => ({
    value: role.id,
    inputDisplay: role.name
  }))

  return (
    <EuiFlyout
      ownFocus
      onClose={() => setIsInviteMemberFlyout(false)}
      aria-labelledby={simpleFlyoutTitleId}
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="s">
          <h2 id={simpleFlyoutTitleId} style={{ textAlign: 'center' }}>
            Invite Teammates
          </h2>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiText textAlign="center">
          <p>Add other collaborators to your project</p>
        </EuiText>
        {inviteCode && (
          <ClipBoardCallOut>
            <EuiText size="s" style={{ color: '#333333', paddingLeft: '10px' }}>
              Copy link to invite a team member
            </EuiText>
            <EuiCopy textToCopy={inviteUrl}>
              {copy => (
                <ClipBoardButton onClick={copy} iconType={CopyClipboard}>
                  {inviteUrl}
                </ClipBoardButton>
              )}
            </EuiCopy>
          </ClipBoardCallOut>
        )}
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form">
          {inviteCode ? (
            <EuiFormRow
              label="First name"
              isInvalid={!!errors?.firstName}
              error={errors?.firstName}
              fullWidth
              isDisabled
            >
              <EuiFieldText
                value={form.firstName}
                onChange={event => setValue('firstName', event.target.value)}
                isInvalid={!!errors?.firstName}
                fullWidth
              />
            </EuiFormRow>
          ) : (
            <EuiFormRow
              label="First name"
              isInvalid={!!errors?.firstName}
              error={errors?.firstName}
              fullWidth
            >
              <EuiFieldText
                value={form.firstName}
                onChange={event => setValue('firstName', event.target.value)}
                isInvalid={!!errors?.firstName}
                fullWidth
              />
            </EuiFormRow>
          )}
          {inviteCode ? (
            <EuiFormRow
              label="Last name"
              error={errors?.lastName}
              isInvalid={!!errors?.lastName}
              fullWidth
              isDisabled
            >
              <EuiFieldText
                value={form.lastName}
                onChange={event => setValue('lastName', event.target.value)}
                isInvalid={!!errors?.lastName}
                fullWidth
              />
            </EuiFormRow>
          ) : (
            <EuiFormRow
              label="Last name"
              error={errors?.lastName}
              isInvalid={!!errors?.lastName}
              fullWidth
            >
              <EuiFieldText
                value={form.lastName}
                onChange={event => setValue('lastName', event.target.value)}
                isInvalid={!!errors?.lastName}
                fullWidth
              />
            </EuiFormRow>
          )}
          <EuiSpacer size="l" />
          {inviteCode ? (
            <EuiFormRow
              label="Email"
              error={errors?.email}
              isInvalid={!!errors?.email}
              fullWidth
              isDisabled
            >
              <EuiFieldText
                isInvalid={!!errors?.lastName}
                onChange={event => setValue('email', event.target.value)}
                fullWidth
              />
            </EuiFormRow>
          ) : (
            <EuiFormRow
              label="Email"
              error={errors?.email}
              isInvalid={!!errors?.email}
              fullWidth
            >
              <EuiFieldText
                isInvalid={!!errors?.lastName}
                onChange={event => setValue('email', event.target.value)}
                fullWidth
              />
            </EuiFormRow>
          )}
          {inviteCode ? (
            <EuiFormRow
              label="Assign role"
              error={errors?.adminRoles}
              isInvalid={!!errors?.adminRoles}
              fullWidth
              isDisabled
            >
              <EuiSuperSelect
                options={options}
                valueOfSelected={
                  form.adminRoles.length > 0 ? form.adminRoles[0] : undefined
                }
                onChange={option => {
                  setValue('adminRoles', [option])
                }}
                isInvalid={!!errors?.adminRoles}
                fullWidth
              />
            </EuiFormRow>
          ) : (
            <EuiFormRow
              label="Assign role"
              error={errors?.adminRoles}
              isInvalid={!!errors?.adminRoles}
              fullWidth
            >
              <EuiSuperSelect
                options={options}
                valueOfSelected={
                  form.adminRoles.length > 0 ? form.adminRoles[0] : undefined
                }
                onChange={option => {
                  setValue('adminRoles', [option])
                }}
                isInvalid={!!errors?.adminRoles}
                fullWidth
              />
            </EuiFormRow>
          )}
        </EuiForm>

        <EuiSpacer size="xl" />
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            {inviteCode ? (
              <EuiButton
                fill
                onClick={() => {
                  setIsInviteMemberFlyout(false)
                  onInvite()
                }}
              >
                Close
              </EuiButton>
            ) : (
              <EuiButtonEmpty
                iconType="cross"
                flush="left"
                onClick={() => setIsInviteMemberFlyout(false)}
              >
                Cancel
              </EuiButtonEmpty>
            )}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            {inviteCode ? null : (
              <EuiButton
                fill
                type="submit"
                onClick={() => submit()}
                isLoading={loading}
              >
                Invite
              </EuiButton>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  )
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
  const { toast, toasts, removeAllToast } = useToastStore()
  const { getAdminUsers, removeUser, getAdminRoles, updateUserRoles } =
    useAdminUsersStore()
  const [teamMembers, setTeamMembers] = useState<TeamMemberProps[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditTeamMemberFlyoutVisible, setisEditTeamMemberFlyoutVisible] =
    useState(false)
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

  const [isRemoveMemberModalVisible, setIsRemoveMemberModalVisible] =
    useState(false)
  const closeRemoveMemberModal = () => setIsRemoveMemberModalVisible(false)
  const showRemoveMemberModal = () => setIsRemoveMemberModalVisible(true)
  const [isChangeMemberRoleModalVisible, setChangeMemberRoleModalVisible] =
    useState(false)
  const closeChangeMemberRoleModal = () =>
    setChangeMemberRoleModalVisible(false)
  const showChangeMemberRoleModal = () => setChangeMemberRoleModalVisible(true)
  const modalFormId = useGeneratedHtmlId({ prefix: 'modalForm' })
  const [rolesCheckboxSelectionMap, setRolesCheckboxSelectionMap] =
    useState<any>({})

  const [isInviteMemberFlyout, setIsInviteMemberFlyout] = useState(false)

  const columns: EuiBasicTableColumn<any>[] = useMemo(() => {
    return [
      {
        name: 'User',
        truncateText: true,
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
        },
        mobileOptions: {
          render: item => (
            <>
              <span>
                {item.firstName} {item.lastName}
              </span>
              {isOwner(item) ? <OwnerBadge>Owner</OwnerBadge> : ''}
            </>
          ),
          width: '100%',
          enlarge: true,
          truncateText: false
        }
      },
      {
        name: 'Role',
        truncateText: true,
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
                if (toasts.length) {
                  removeAllToast()
                  toast(undefined, "Owner role can't be changed", 'danger')
                  return
                }
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
                  (newCheckboxIdToSelectedMap[roleId] =
                    adminRolesId.includes(roleId))
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
                if (toasts.length) {
                  removeAllToast()
                  toast(undefined, "Can't remove Owner", 'danger')
                  return
                }
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
  }, [roles, toasts])

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
          {hasPermission('invite:admin-users') && (
            <EuiButtonEmpty
              iconType={'plus'}
              onClick={() => setIsInviteMemberFlyout(true)}
            >
              Add team members
            </EuiButtonEmpty>
          )}
        </TableMetaWrapper>
        {isInviteMemberFlyout ? (
          <InviteFlyout
            setIsInviteMemberFlyout={setIsInviteMemberFlyout}
            roles={roles}
            onInvite={getTeamMembers}
          />
        ) : null}
        {!hasPermission('index:admin-users') ? null : (
          <EuiBasicTable
            items={teamMembers}
            itemId={'id'}
            hasActions={true}
            loading={loading}
            columns={columns}
            responsive={true}
            isExpandable={true}
          />
        )}

        {removeMemberModal}
        {changeMemberRoleModal}
      </Wrapper>
    </PageWrapper>
  )
}

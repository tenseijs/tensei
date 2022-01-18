import { AxiosResponse, AxiosError } from 'axios'
import create, { State } from 'zustand'
import { devtools } from 'zustand/middleware'

import { User, UserPermission, UserRole } from '@tensei/components'

interface AuthState extends State {
  user: User
  setUser: (user: User) => void
  permissions: string[]
}

export interface AuthMethods extends State {
  login: (
    input: LoginInput
  ) => Promise<[AxiosResponse | null, AxiosError | null]>
  register: (
    credentials: RegisterUserInput
  ) => Promise<[AxiosResponse | null, AxiosError | null]>
  verifyInviteCode: (
    inviteCode: string
  ) => Promise<[AxiosResponse | null, AxiosError | null]>
  joinTeam: (
    credentials: JoinTeamInput
  ) => Promise<[AxiosResponse | null, AxiosError | null]>
  logout: () => Promise<[AxiosResponse | null, AxiosError | null]>
  updateProfile: (
    input: UpdateUserProfileInput
  ) => Promise<[AxiosResponse | null, AxiosError | null]>
  updatePassword: (
    input: UpdateUserPasswordInput
  ) => Promise<[AxiosResponse | null, AxiosError | null]>
  mergePermissions: () => void
  hasPermission: (
    permission: string
  ) => boolean
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterUserInput {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface JoinTeamInput {
  firstName: string
  lastName: string
  email: string
  password: string
  inviteCode: string
}

export interface UpdateUserProfileInput {
  firstName: string
  lastName: string
  email: string
}

export interface UpdateUserPasswordInput {
  currentPassword: string
  newPassword: string
}

export const useAuthStore = create<AuthState & AuthMethods>(
  devtools((set, get) => ({
    user: window.Tensei?.state?.admin,
    permissions: [],
    setUser(user: User) {
      set({
        user
      })
    },
    async login(input: LoginInput) {
      return window.Tensei.api.post('/auth/login', input)
    },
    async register(input: RegisterUserInput) {
      return window.Tensei.api.post('/auth/register', input)
    },
    async verifyInviteCode(inviteCode: string) {
      return window.Tensei.api.post('/auth/verify-invite-code', { inviteCode })
    },
    async joinTeam(input: JoinTeamInput) {
      return window.Tensei.api.post('/auth/register', input)
    },
    async logout() {
      return window.Tensei.api.post('/auth/logout')
    },
    async updateProfile(input: UpdateUserProfileInput) {
      return window.Tensei.api.patch('/auth/update-profile', input)
    },
    async updatePassword(input: UpdateUserPasswordInput) {
      return window.Tensei.api.post('/auth/change-password', input)
    },
    mergePermissions() {
      let permissionStrings: string[] = []
      get().user?.adminRoles.forEach((role: UserRole) => {
        permissionStrings.push(...role.adminPermissions.map((permission: UserPermission) => (
          permission.slug
        )))
      })

      set({
        permissions: [
          ...permissionStrings
        ]
      })
    },
    hasPermission(permission: string) {
      return get().permissions.includes(permission)
    }
  }))
)

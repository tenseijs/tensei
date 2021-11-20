import { AxiosResponse, AxiosError } from 'axios'
import create, { State } from 'zustand'
import { devtools } from 'zustand/middleware'

import { User } from '@tensei/components'

interface AuthState extends State {
  user: User
  setUser: (user: User) => void
}

export interface AuthMethods extends State {
  login: (
    credentials: LoginCredentials
  ) => Promise<[AxiosResponse | null, AxiosError | null]>
  register: (
    credentials: RegisterCredentials
  ) => Promise<[AxiosResponse | null, AxiosError | null]>
  logout: () => Promise<[AxiosResponse | null, AxiosError | null]>
  updateProfile: (
    input: UpdateUserProfileInput
  ) => Promise<[AxiosResponse | null, AxiosError | null]>
  updatePassword: (
    input: UpdateUserPasswordInput
  ) => Promise<[AxiosResponse | null, AxiosError | null]>
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface UpdateUserProfileInput {
  firstName: string
  lastName: string
  email: string
}

export interface UpdateUserPasswordInput {
  currentPassword: string,
  newPassword: string
}

export const useAuthStore = create<AuthState & AuthMethods>(
  devtools((set, get) => ({
    user: window.Tensei.state.admin,
    setUser(user: User) {
      set({
        user
      })
    },
    async login(credentials: LoginCredentials) {
      return window.Tensei.api.post('/auth/login', credentials)
    },
    async register(credentials: RegisterCredentials) {
      return window.Tensei.api.post('/auth/register', credentials)
    },
    async logout() {
      return window.Tensei.api.post('/auth/logout')
    },
    async updateProfile(input: UpdateUserProfileInput) {
      return window.Tensei.api.patch('/auth/update-profile', input)
    },
    async updatePassword(input: UpdateUserPasswordInput) {
      return window.Tensei.api.post('/auth/change-password', input)
    }
  }))
)

import create, { State } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AxiosError, AxiosResponse } from 'axios'

export interface TeamMemberProps {
  id: string | number
  firstName: string
  lastName: string
  email: string
  password: string
  active: boolean
  adminRoles: any[]
  createdAt: string
  updatedAt: string
}

interface AdminUserMethods extends State {
  getAdminUsers: () => Promise<[AxiosResponse | null, AxiosError | null]>,
  removeUser: (id: string) => Promise<[AxiosResponse | null, AxiosError | null]>
}

export const useAdminUsersStore = create<AdminUserMethods>(
  devtools((set, get) => ({
    async getAdminUsers() {
      return window.Tensei.api.get('admin-users?populate=adminRoles.adminPermissions')
    },
    async removeUser(id: string) {
      return window.Tensei.api.delete(`admin-users/${id}`)
    }
  }))
)

import { ReactChild } from 'react'
import create, { State } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AxiosError, AxiosResponse } from 'axios'

interface AdminUserMethods extends State {
  getAdminUsers: () => Promise<[AxiosResponse | null, AxiosError | null]>
}

export const useAdminUsersStore = create<AdminUserMethods>(
  devtools((set, get) => ({
    async getAdminUsers() {
      return window.Tensei.api.get('admin-users?populate=adminRoles.adminPermissions')
    }
  }))
)

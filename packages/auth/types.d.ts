import { PermissionContract, RoleContract } from './build'
export * from './build'

declare module '@tensei/orm' {
  export interface UserModel {
    allTeams: () => Promise<TeamModel[]>
    ownsTeam: (team: TeamModel) => Promise<boolean>
    belongsToTeam: (team: TeamModel) => Promise<boolean>
    teamPermissions: (team: TeamModel) => Promise<string[]>
    teamMembership: (team: TeamModel) => Promise<MembershipModel>
    hasTeamPermission: (team: TeamModel, permission: string) => Promise<boolean>

    // Roles and permissions
    hasRole: () => boolean
    hasPermission: () => boolean
    assignRole: () => Promise<void>
    removeRole: () => Promise<void>
    getAllPermissions: () => PermissionContract[]
    getAllRoles: () => RoleContract[]
  }
}

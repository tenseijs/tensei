declare module '@tensei/orm' {
  import { TeamModel, MembershipModel } from '@tensei/orm'

  export interface UserModel {
    allTeams: () => Promise<TeamModel[]>
    ownsTeam: (team: TeamModel) => Promise<boolean>
    belongsToTeam: (team: TeamModel) => Promise<boolean>
    teamPermissions: (team: TeamModel) => Promise<string[]>
    teamMembership: (team: TeamModel) => Promise<MembershipModel>
    hasTeamPermission: (team: TeamModel, permission: string) => Promise<boolean>
  }
}

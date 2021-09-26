import { AuthContract } from '../config'
import { Request, Response, RequestHandler } from 'express'
import {
  belongsTo,
  resource,
  text,
  hasMany,
  array,
  route,
  Utils,
  graphQlQuery,
  ResourceContract,
  GraphQlMiddleware
} from '@tensei/common'
import { validateAll, validations } from 'indicative/validator'

export const findTeamMiddleware: RequestHandler = (request, response, next) => {
  const { team, params } = request

  if (!team) {
    return response.formatter.notFound(
      `Could not find team with ID ${params.team}.`
    )
  }

  next()
}

export const isTeamOwnerMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
  const { team, authUser, authenticationError } = request

  if (!authUser.ownsTeam(team)) {
    throw authenticationError(`Unauthorized.`)
  }

  next()
}

export const findTeamQueryMiddleware: GraphQlMiddleware = (
  resolve,
  parent,
  args,
  ctx,
  info
) => {
  const { team, userInputError } = ctx

  if (!team) {
    throw userInputError(`Could not find team with ID ${args.teamId}.`)
  }

  return resolve(parent, args, ctx, info)
}

const handleFetchAllTeams = (auth: AuthContract) => async (
  request: Request,
  response: Response
) => {
  const { authUser } = request

  return response.formatter.ok(
    (await authUser.allTeams()).map((userTeam: any) => {
      const { team: removeTeam, ...rest } = userTeam

      return {
        ...rest,
        memberships: rest.memberships.toJSON().map((membership: any) => {
          const { team, ...rest } = membership

          return rest
        })
      }
    })
  )
}

const handleInviteTeamMember = (auth: AuthContract) => async (
  request: Request
) => {
  const { team, repositories, userInputError } = request

  const payload = request.body.object ? request.body.object : request.body

  try {
    await validateAll(payload, {
      permissions: [
        validations.array(),
        validations.required(),
        validations.min([1])
      ],
      'permissions.*': [
        validations.in(
          auth.config.teamPermissions.map(permission => permission.config.slug)
        ),
        validations.required(),
        validations.string()
      ],
      email: [validations.required(), validations.string()]
    })
  } catch (error) {
    throw userInputError('Validation failed.', {
      errors: error
    })
  }

  const invitedUser = await repositories[
    auth.__resources.user.data.camelCaseNamePlural
  ]().findOne({
    email: payload.email
  })

  if (!invitedUser) {
    throw userInputError('The invited user does not exist.')
  }

  if (await invitedUser.belongsToTeam(team)) {
    return
  }

  await repositories.memberships().persistAndFlush(
    repositories.memberships().create({
      team,
      [auth.__resources.user.data.camelCaseName]: invitedUser,
      permissions: payload.permissions
    })
  )
}

export class Teams {
  constructor(private auth: AuthContract) {}

  teamResource() {
    return resource(this.auth.config.teamResource)
      .hideOnFetchApi()
      .canDelete(({ authUser, team }) => authUser.ownsTeam(team))
      .canUpdate(({ authUser, team }) => authUser.ownsTeam(team))
      .fields([
        text('Name').rules('required', 'min:2', 'max:24'),
        belongsTo(this.auth.config.userResource, 'owner')
          .notNullable()
          .hideOnUpdateApi(),
        hasMany('Membership')
      ])
  }

  teamMembershipResource() {
    return (
      resource('Membership')
        .fields([
          belongsTo(this.auth.config.teamResource).creationRules('required'),
          array('Permissions').default([]),
          belongsTo(this.auth.config.userResource).creationRules('required')
        ])
        // Only the owner of the team can delete the team.
        .canDelete(({ authUser, team }) => authUser.ownsTeam(team))
        .hideOnUpdateApi()
        .hideOnCreateApi()
        .hideOnFetchApi()
    )
  }

  types(gql: any) {
    if (!this.auth.config.teams) {
      return ``
    }

    return gql`
      ${this.auth.config.teamPermissions.length > 0
        ? `
    enum TeamPermissionString {
      ${this.auth.config.teamPermissions.map(
        permission => `
        ${permission.config.slug.split(':').join('_').toUpperCase()}
      `
      )}
    }

    type TeamPermission {
      slug: String!
      description: String
      default: Boolean!
    }
    `
        : ``}

      input InviteTeamMemberInput {
        permissions: [TeamPermissionString]
        email: String!
      }

      extend type Mutation {
        inviteTeamMember(teamId: ID!, object: InviteTeamMemberInput): Boolean!
      }

      extend type Query {
        allTeams: [Team]
        teamPermissions: [TeamPermission]
        teamMemberships(teamId: ID!): [Membership]
      }
    `
  }

  queries(resources: ResourceContract[]) {
    if (!this.auth.config.teams) {
      return []
    }

    return [
      graphQlQuery('Get team permissions')
        .path('teamPermissions')
        .authorize(({ authUser, team }) => authUser.belongsToTeam(team))
        .query()
        .handle(async (_, args, ctx, info) => {
          return this.auth.config.teamPermissions.map(
            permission => permission.config
          )
        }),
      graphQlQuery('Invite team member')
        .path('inviteTeamMember')
        .mutation()
        .authorize(({ authUser, team }) => authUser.ownsTeam(team))
        .middleware(findTeamQueryMiddleware)
        .handle(async (_, args, ctx, info) => {
          const permissions = ctx?.body?.object?.permissions?.map(
            (permission: string) =>
              permission.split('_').join(':').toLowerCase()
          )

          ctx.body.object.permissions = permissions

          await handleInviteTeamMember(this.auth)(ctx as any)

          return true
        }),
      graphQlQuery('All teams for a user')
        .path('allTeams')
        .authorize(({ authUser }) => !!authUser)
        .handle(async (_, args, ctx, info) => {
          const { authUser } = ctx

          const teams = await authUser.allTeams()

          await Utils.graphql.populateFromResolvedNodes(
            resources,
            ctx.manager,
            ctx.databaseConfig.type!,
            this.auth.__resources.team,
            Utils.graphql.getParsedInfo(info),
            teams
          )

          return teams
        }),
      graphQlQuery('Get team memberships')
        .path('teamMemberships')
        .authorize(
          async ({ authUser, team }) => await authUser.belongsToTeam(team)
        )
        .handle(async (_, args, ctx, info) => {
          const { team, manager } = ctx

          const memberships = await manager.find('Membership', {
            team
          })

          await Utils.graphql.populateFromResolvedNodes(
            resources,
            ctx.manager,
            ctx.databaseConfig.type!,
            this.auth.__resources.membership,
            Utils.graphql.getParsedInfo(info),
            memberships
          )

          return memberships
        })
    ]
  }

  defineUserResourceMethods(userResource: ResourceContract) {
    const self = this

    userResource.method('ownsTeam', function (this: any, team: any) {
      if (!team) {
        return false
      }

      return (
        team.owner.toString() === this.id.toString() ||
        team.owner?.id.toString() === this.id.toString()
      )
    })

    userResource.method(
      'teamMembership',
      async function (this: any, team: any) {
        const membership = await this.ctx.repositories.memberships().findOne({
          team,
          [self.auth.__resources.user.data.camelCaseName]: this
        })

        return membership
      }
    )

    userResource.method('belongsToTeam', async function (this: any, team: any) {
      if (this.ownsTeam(team)) {
        return true
      }

      const teamMembership = await this.teamMembership(team)

      return !!teamMembership
    })

    userResource.method(
      'hasTeamPermission',
      async function (this: any, team: any, permission: string) {
        if (this.ownsTeam(team)) {
          return true
        }

        const membership = await this.teamMembership(team)

        if (!membership) {
          return false
        }

        return membership.permissions.includes(permission)
      }
    )

    userResource.method(
      'teamPermissions',
      async function (this: any, team: any) {
        if (this.ownsTeam(team)) {
          return self.auth.config.teamPermissions.map(
            permission => permission.config.slug
          )
        }

        const membership = await this.teamMembership(team)

        if (!membership) {
          return []
        }

        return membership.permissions
      }
    )

    userResource.method('allTeams', async function (this: any) {
      const [ownedTeams, memberships] = await Promise.all([
        this.repositories.teams().find(
          { owner: this },
          {
            populate: [
              `memberships.${self.auth.__resources.user.data.camelCaseName}`,
              'owner'
            ]
          }
        ),
        this.repositories.memberships().find(
          { [self.auth.__resources.user.data.camelCaseName]: this.id },
          {
            populate: [`${self.auth.__resources.team.data.camelCaseName}.owner`]
          }
        )
      ])

      const membershipTeams = memberships.map(
        (membership: any) => membership.team
      )

      await Promise.all(
        membershipTeams.map((team: any) => team.memberships.init())
      )

      return [...ownedTeams, ...membershipTeams]
    })
  }

  routes() {
    if (!this.auth.config.teams) {
      return []
    }

    return [
      route('Get Team Permissions')
        .get()
        .authorize(({ authUser }) => !!authUser)
        .description(`Get a list of all existing team permissions.`)
        .path(this.auth.__getApiPath('teams/permissions'))
        .handle((_, { formatter: { ok } }) =>
          ok(
            this.auth.config.teamPermissions.map(
              permission => permission.config
            )
          )
        ),
      route('Get Team Memberships By ID')
        .get()
        .authorize(({ authUser }) => !!authUser)
        .middleware([findTeamMiddleware])
        .path(this.auth.__getApiPath('teams/:team/memberships'))
        .handle(async ({ repositories, team }, { formatter: { ok } }) => {
          return ok(
            await repositories.memberships().find(
              {
                team
              },
              {
                populate: [this.auth.__resources.user.data.camelCaseName]
              }
            )
          )
        }),
      route('Invite existing user to team')
        .post()
        .description(`Create a team membership for a user.`)
        .middleware([findTeamMiddleware, isTeamOwnerMiddleware])
        .path(this.auth.__getApiPath('teams/:team/invites'))
        .handle(async (request, response) => {
          await handleInviteTeamMember(this.auth)(request)

          return response.formatter.noContent({})
        }),
      route('Fetch all user teams')
        .get()
        .authorize(({ authUser }) => !!authUser)
        .path(this.auth.__getApiPath('teams'))
        .handle(handleFetchAllTeams(this.auth))
    ]
  }
}

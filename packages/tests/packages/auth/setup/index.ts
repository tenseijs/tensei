export * from '../../../helpers'
import { setup } from '../../../helpers'

import { rest } from '@tensei/rest'
import { graphql } from '@tensei/graphql'
import { auth, permission } from '@tensei/auth'

export const setupTeams = () => {
  return setup([
    auth()
      .teams()
      .teamPermissions([
        permission('Create servers', 'Can create servers on the platform'),
        permission('Create databases', 'Can create databases'),
        permission('Attach databases', 'Can attach databases')
      ])
      .user('Customer')
      .plugin(),
    rest().plugin(),
    graphql().plugin()
  ])
}

export * from '../../../helpers'
import { setup } from '../../../helpers'

import { rest } from '@tensei/rest'
import { graphql } from '@tensei/graphql'
import { auth, permission } from '@tensei/auth'

export const setupTeams = () => {
  return setup([
    auth()
      .teamPermissions([
        permission('create:servers', 'Can create servers on the platform'),
        permission('create:databases', 'Can create databases'),
        permission('attach:databases', 'Can attach databases')
      ])
      .user('Customer')
      .teams()
      .plugin(),
    rest().plugin(),
    graphql().plugin()
  ])
}

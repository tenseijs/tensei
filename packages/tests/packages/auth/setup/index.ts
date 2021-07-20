export * from '../../../helpers'
import { setup } from '../../../helpers'

import { auth } from '@tensei/auth'
import { rest } from '@tensei/rest'

export const setupTeams = () => {
  return setup([auth().user('Customer').teams().plugin(), rest().plugin()])
}

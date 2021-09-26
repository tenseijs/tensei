import { auth } from '@tensei/auth'
import { graphql } from '@tensei/graphql'
import { welcome, tensei, cors } from '@tensei/core'

export default tensei()
  .root(__dirname)
  .plugins([welcome(), auth().plugin(), graphql().plugin(), cors()])
  .start()
  .catch(console.error)

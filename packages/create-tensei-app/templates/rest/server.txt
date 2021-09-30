import { auth } from '@tensei/auth'
import { rest } from '@tensei/rest'
import { welcome, tensei, cors } from '@tensei/core'

export default tensei()
  .root(__dirname)
  .plugins([welcome(), auth().plugin(), rest().plugin(), cors()])
  .start()
  .catch(console.error)

import { resource, boolean } from '@tensei/common'

export default resource('Resource Can Update')
  .canUpdate(({ body }) => body.canUpdate === true)
  .fields([boolean('Like')])

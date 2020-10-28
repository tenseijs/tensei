import { resource, boolean } from '@tensei/common'

// this resource has not relationship with any other resource

export default resource('Reaction').fields([boolean('Like')])

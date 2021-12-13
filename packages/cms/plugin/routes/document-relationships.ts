import { route } from '@tensei/common'

export const DocumentRelationshipsRoute = route('Document Relationsips')
  .path('relationships/:resource/:documentId')
  .get()
  .handle(async (request, response) => {
    return response.formatter.ok({})
  })

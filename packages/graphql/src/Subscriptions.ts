import { ResourceContract } from '@tensei/common'

export const defineCreateSubscriptionsForResource = (
  resource: ResourceContract
) => {
  return `
    ${resource.data.camelCaseName}Created(filter: JSONObject): ${resource.data.pascalCaseName}!    
`
}

export const defineUpdateSubscriptionsForResource = (
  resource: ResourceContract
) => {
  return `
    ${resource.data.camelCaseName}Updated(filter: JSONObject): ${resource.data.pascalCaseName}!    
`
}

export const defineDeleteSubscriptionsForResource = (
  resource: ResourceContract
) => {
  return `
    ${resource.data.camelCaseName}Deleted(filter: JSONObject): ${resource.data.pascalCaseName}!    
`
}

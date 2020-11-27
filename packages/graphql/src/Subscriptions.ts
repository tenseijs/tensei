import { PubSub } from 'apollo-server-express'
import { ResourceContract } from '@tensei/common'

export const defineCreateSubscriptionsForResource = (
    resource: ResourceContract
) => {
    return `
    ${resource.data.snakeCaseName}_inserted(filter: JSONObject): ${resource.data.snakeCaseName}!    
`
}

export const defineUpdateSubscriptionsForResource = (
    resource: ResourceContract
) => {
    return `
    ${resource.data.snakeCaseName}_updated(filter: JSONObject): ${resource.data.snakeCaseName}!    
`
}

export const defineDeleteSubscriptionsForResource = (
    resource: ResourceContract
) => {
    return `
    ${resource.data.snakeCaseName}_deleted(filter: JSONObject): ${resource.data.snakeCaseName}!    
`
}

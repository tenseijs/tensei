import { Request } from 'express'
import { Resource } from './Resource'
import { DataPayload } from '../config'
import { DatabaseRepositoryInterface } from '../databases/DatabaseRepositoryInterface'

export class ResourceManager {
    constructor(private resources: Resource[], private db: DatabaseRepositoryInterface) {}

    private findResource = (resourceSlug: string) => {
        const resource = this.resources.find(resource => resource)

        if (! resource) {
            throw new Error(`Resource ${resourceSlug} not found.`)
        }

        return resource
    }

    public create(request: Request, resourceSlugOrResource: string|Resource, payload: DataPayload) {
        const resource = typeof resourceSlugOrResource === 'string' ? this.findResource(resourceSlugOrResource) : resourceSlugOrResource

        const parsedPayload = resource.hooks.beforeCreate(payload, request)

        return this.db.create(resource, parsedPayload)
    }
}

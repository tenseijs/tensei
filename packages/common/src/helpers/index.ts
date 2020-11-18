import { Request } from 'express'
import { ResourceContract } from '@tensei/common'

export class ResourceHelpers {
    public resource: ResourceContract | null = null

    constructor(public resources: ResourceContract[]) {}

    public findResource = (resourceSlug: string | ResourceContract) => {
        if (!resourceSlug) {
            throw {
                message: `Resource ${resourceSlug} not found.`,
                status: 404
            }
        }

        if (typeof resourceSlug !== 'string') {
            return resourceSlug
        }

        const resource = this.resources.find(
            resource =>
                resource.data.slug === resourceSlug ||
                resource.data.name === resourceSlug
        )

        if (!resource) {
            throw {
                message: `Resource ${resourceSlug} not found.`,
                status: 404
            }
        }

        return resource
    }

    getFieldFromResource = (
        resource: ResourceContract,
        databaseField: string
    ) => {
        return resource.data.fields.find(
            field =>
                field.name === databaseField ||
                field.databaseField === databaseField
        )
    }

    setResource = (resourceOrSlug: ResourceContract | string) => {
        this.resource = this.findResource(resourceOrSlug)

        return this
    }

    protected getCurrentResource = () => {
        if (!this.resource) {
            throw {
                message: `Missing resource for this operation.`,
                status: 400
            }
        }

        return this.resource
    }
}

/**
 * Apply typescript mixins to a class constructor.
 *
 * @param derivedCtor any
 * @param constructors any
 */
export const mix = (derivedCtor: any, constructors: any[]) => {
    constructors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            const propertyDescription = Object.getOwnPropertyDescriptor(
                baseCtor.prototype,
                name
            )

            if (!propertyDescription) {
                return
            }

            Object.defineProperty(
                derivedCtor.prototype,
                name,
                propertyDescription
            )
        })
    })
}

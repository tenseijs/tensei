import { AnyEntity, EntityName, FilterQuery } from '@mikro-orm/core'
import Express from 'express'
import BaseController from './Controller'

class FindResourceController extends BaseController {
    public show = async (
        { params, manager, resources, query }: Express.Request,
        { formatter: { badRequest, ok, notFound } }: Express.Response
    ) => {
        const resource = resources[params.resource]
        try {
            const findOptions = this.parseQueryToFindOptions(query, resource)

            const model = await manager.findOne(
                resource.data.pascalCaseName as EntityName<AnyEntity<any>>,
                params.resourceId as FilterQuery<AnyEntity<any>>,
                findOptions
            )

            if (!model) {
                return notFound(
                    `could not find ${resource.data.pascalCaseName} with ID ${params.resourceId}`
                )
            }

            return ok(model)
        } catch (error) {
            return badRequest({
                message: 'The request was not understood.'
            })
        }
    }

    public showRelation = async (
        { params, manager, resources, query }: Express.Request,
        { formatter: { badRequest, ok, notFound } }: Express.Response
    ) => {
        const resource = resources[params.resource]
        const whereOptions = this.parseQueryToWhereOptions(query)

        try {
            const model = await manager.findOne(
                resource.data.pascalCaseName as EntityName<AnyEntity<any>>,
                params.resourceId as FilterQuery<AnyEntity<any>>
            )

            await manager.populate(
                model,
                [params.relatedResource],
                whereOptions
            )

            return ok(model?.[params.relatedResource])
        } catch (error) {
            if (error?.name === 'ValidationError') {
                return notFound(
                    `The ${resource.data.pascalCaseName} model does not have a '${params.relatedResource}' property`
                )
            }
            return badRequest({
                message: 'The request was not understood.'
            })
        }
    }
}

export default new FindResourceController()

import Express from 'express'
import BaseController from './Controller'

class IndexResourceController extends BaseController {
    public index = async (
        request: Express.Request,
        { formatter: { badRequest, ok } }: Express.Response
    ) => {
        const { manager, params, resources, query } = request

        const resource = resources[params.resource]

        const findOptions = this.parseQueryToFindOptions(query, resource)
        const whereOptions = this.parseQueryToWhereOptions(query)

        try {
            const [data, total] = await manager.findAndCount(
                resource.data.pascalCaseName,
                whereOptions,
                findOptions
            )

            return ok(data, this.getPageMetaFromFindOptions(total, findOptions))
        } catch (error) {
            console.log(error)
            return badRequest({
                message: 'The request was not understood.'
            })
        }
    }
}

export default new IndexResourceController()

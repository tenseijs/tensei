import Fs from 'fs'
import Path from 'path'
import {
  FindOptions,
  FilterQuery,
  AnyEntity,
  EntityName,
  ReferenceType
} from '@mikro-orm/core'
import Mustache from 'mustache'
import { RequestHandler, request } from 'express'
import { responseEnhancer } from 'express-response-formatter'
import {
  route,
  Utils,
  event,
  plugin,
  RouteContract,
  ResourceContract,
  RouteParameter,
  AuthorizeFunction
} from '@tensei/common'

import {
  parseQueryToFindOptions,
  parseQueryToWhereOptions
} from './populate-helpers'
import { DataPayload } from '@tensei/common'

import { generateResourceInterfaces } from './sdk/generators/interfaces'
import { generateFetchWrapperForResources } from './sdk/generators/rest'
import { formatContent } from './sdk/generators/helpers'

class Rest {
  private getApiPath = (path: string) => {
    return `/${this.path}/${path}`
  }

  private path: string = 'api'

  private routePrefix: string = ''

  basePath(path: string) {
    this.path = path

    return this
  }

  prefix(prefix: string) {
    this.routePrefix = prefix

    return this
  }

  private getPageMetaFromFindOptions(
    total: number,
    findOptions: FindOptions<any>
  ) {
    return {
      total,
      page:
        findOptions.offset || (findOptions.offset === 0 && findOptions.limit)
          ? Math.ceil((findOptions.offset + 1) / findOptions.limit!)
          : 0,
      per_page: findOptions.limit ? findOptions.limit : 0,
      page_count: Math.ceil(total / findOptions.limit!) || 0
    }
  }

  private getRouteId(id: string) {
    return this.routePrefix ? `${this.routePrefix}_${id}` : id
  }

  private extendRoutes(
    resources: ResourceContract[],
    getApiPath: (path: string) => string
  ) {
    const routes: RouteContract[] = []

    const paginationParameters = (
      resource: ResourceContract
    ): RouteParameter[] => {
      return [
        {
          in: 'query',
          name: 'page',
          type: 'number',
          validation: ['required'],
          description: `The page to be fetched.`
        },
        {
          in: 'query',
          name: 'per_page',
          type: 'number',
          validation: ['required'],
          description: `The page to be fetched.`
        },
        {
          in: 'query',
          name: 'fields',
          type: 'string',
          validation: [
            `in:${resource.data.fields
              .filter(field => !field.showHideFieldFromApi.hideOnFetchApi)
              .map(field => field.databaseField)
              .join(',')}`
          ],
          description: `The list of fields to be selected from the database (separated by commas).`
        },
        {
          in: 'query',
          name: 'populate',
          type: 'string',
          validation: [
            `in:${resource.data.fields
              .filter(field => field.isRelationshipField)
              .map(field => field.databaseField)
              .join(',')}`
          ],
          description: `Populate related resources (separated by commas). Populate nested resources by using the dot(.) notation.`
        },
        {
          in: 'query',
          name: 'sort',
          type: 'string',
          description: `Sort the results based on one of the available fields of this resource.`
        },
        {
          in: 'query',
          name: 'where',
          type: 'string',
          description: `Filter results based on a where query.`
        }
      ]
    }

    const authorizeMiddleware = (checks: AuthorizeFunction[]) => {
      return (async (request, response, next) => {
        const authorized = await Promise.all(
          checks.map(fn => fn(request, request.entity))
        )

        if (authorized.filter(result => result).length !== checks.length) {
          return response.status(401).json({
            message: 'Unauthorized.'
          })
        }

        return next()
      }) as RequestHandler
    }

    const findSingleEntityMiddleware = (resource: ResourceContract) => {
      return (async (request, response, next) => {
        const findOptions = parseQueryToFindOptions(request.query, resource)

        const entity = await request.manager.findOne(
          resource.data.pascalCaseName,
          request.params.id,
          findOptions
        )

        if (!entity) {
          return response.formatter.notFound(
            `Could not find ${resource.data.snakeCaseName} with ID of ${request.params.id}`
          )
        }

        request.entity = entity

        return next()
      }) as RequestHandler
    }

    resources.forEach(resource => {
      const {
        slugSingular: singular,
        slugPlural: plural,
        pascalCaseName: modelName
      } = resource.data

      !resource.isHiddenOnApi() &&
        !resource.data.hideOnCreateApi &&
        routes.push(
          route(`Insert ${singular}`)
            .post()
            .internal()
            .group(resource.data.label)
            .middleware([
              authorizeMiddleware(
                resource.authorizeCallbacks.authorizedToCreate
              )
            ])
            .parameters(
              resource.data.fields
                .filter(
                  field =>
                    !field.showHideFieldFromApi.hideOnCreateApi &&
                    !['id', '_id', 'created_at', 'updated_at'].includes(
                      field.databaseField
                    )
                )
                .map(field => ({
                  in: 'body',
                  name: field.databaseField,
                  description: field.helpText,
                  validation: field.creationValidationRules.concat(
                    field.validationRules
                  ),
                  type: field.relatedProperty.type || field.property.type!
                }))
            )
            .id(this.getRouteId(`insert_${singular}`))
            .resource(resource)
            .path(getApiPath(plural))
            .description(`Insert a single ${singular}.`)
            .handle(
              async (
                {
                  manager,
                  body,
                  resources: resourcesMap,
                  userInputError,
                  config,
                  query
                },
                response
              ) => {
                const findOptions = parseQueryToFindOptions(query, resource)

                const [passed, payload] = await Utils.validator(
                  resource,
                  manager,
                  resourcesMap
                ).validate(body)

                if (!passed) {
                  throw userInputError('Validation failed.', {
                    errors: payload
                  })
                }

                const entity = manager.create(
                  resource.data.pascalCaseName,
                  body
                ) as any

                await manager.persistAndFlush(entity)

                await manager.populate([entity], findOptions.populate || [])

                config.emitter.emit(`${singular}::created`, entity)

                return response.formatter.created(entity)
              }
            )
        )

      !resource.isHiddenOnApi() &&
        !resource.data.hideOnCreateApi &&
        routes.push(
          route(`Insert ${plural}`)
            .post()
            .internal()
            .group(resource.data.label)
            .middleware([
              authorizeMiddleware(
                resource.authorizeCallbacks.authorizedToCreate
              )
            ])
            .parameters([
              {
                in: 'body',
                name: 'objects',
                description: `An array of ${singular} objects to be created`,
                type: 'array'
              }
            ])
            .id(this.getRouteId(`insert_${plural}`))
            .resource(resource)
            .path(getApiPath(`${plural}/bulk`))
            .description(`Insert multiple ${plural}.`)
            .handle(
              async (
                {
                  manager,
                  body,
                  resources: resourcesMap,
                  config,
                  query,
                  userInputError
                },
                response
              ) => {
                const findOptions = parseQueryToFindOptions(query, resource)

                if (!body.objects) {
                  throw userInputError('Validation failed.', {
                    errors: [
                      {
                        message: 'The objects field is required.',
                        validation: 'required',
                        field: 'objects'
                      }
                    ]
                  })
                }

                const data: any[] = body.objects.map((object: any) =>
                  manager.create(resource.data.pascalCaseName, object)
                )

                const validator = await Utils.validator(
                  resource,
                  manager,
                  resourcesMap
                ).request(request)

                const results: [boolean, DataPayload][] = await Promise.all(
                  body.objects.map((object: any) => validator.validate(object))
                )

                if (
                  results.filter(([passed]) => passed).length !== results.length
                ) {
                  throw userInputError('Validation failed.', {
                    errors: results
                      .map(([passed, payload], index) => [
                        passed,
                        payload,
                        index
                      ])
                      .filter(([passed]) => !passed)
                      .map(([, errors, index]) => ({
                        errors,
                        index
                      }))
                  })
                }

                await manager.persistAndFlush(data)

                await manager.populate(data, findOptions.populate || [])

                config.emitter.emit(
                  `${resource.data.snakeCaseNamePlural}::created`,
                  data
                )

                config.emitter.emit(`${singular}::created`, data)

                return response.formatter.created(data)
              }
            )
        )

      !resource.isHiddenOnApi() &&
        !resource.data.hideOnFetchApi &&
        routes.push(
          route(`Fetch multiple ${plural}`)
            .get()
            .internal()
            .group(resource.data.label)
            .id(plural)
            .middleware([
              authorizeMiddleware(resource.authorizeCallbacks.authorizedToFetch)
            ])
            .parameters(paginationParameters(resource))
            .resource(resource)
            .path(getApiPath(plural))
            .description(
              `This endpoint fetches all ${plural} that match an optional where query.`
            )
            .handle(async ({ manager, query }, response) => {
              const findOptions = parseQueryToFindOptions(query, resource)

              const [entities, total] = await manager.findAndCount(
                modelName,
                parseQueryToWhereOptions(query),
                findOptions
              )

              return response.formatter.ok(
                entities,
                this.getPageMetaFromFindOptions(total, findOptions)
              )
            })
        )

      !resource.isHiddenOnApi() &&
        !resource.data.hideOnFetchApi &&
        routes.push(
          route(`Fetch single ${singular}`)
            .get()
            .parameters([
              {
                in: 'path',
                name: 'id',
                type: 'number',
                validation: ['required'],
                description: `The ID of the ${singular} to fetch.`
              }
            ])
            .group(resource.data.label)
            .internal()
            .id(singular)
            .resource(resource)
            .middleware([
              findSingleEntityMiddleware(resource),
              authorizeMiddleware(resource.authorizeCallbacks.authorizedToShow)
            ])
            .description(
              `This endpoint fetches a single ${singular}. Provide the primary key ID of the entity you want to fetch.`
            )
            .path(getApiPath(`${plural}/:id`))
            .handle(async ({ manager, params, query, entity }, response) => {
              return response.formatter.ok(entity)
            })
        )

      !resource.isHiddenOnApi() &&
        !resource.data.hideOnFetchApi &&
        routes.push(
          route(`Fetch ${singular} relations`)
            .get()
            .middleware([
              authorizeMiddleware(
                resource.authorizeCallbacks.authorizedToFetchRelation
              )
            ])
            .parameters([
              {
                in: 'path',
                name: 'id',
                type: 'number',
                validation: ['required'],
                description: `The ID of the ${singular} to fetch relations of.`
              },
              {
                in: 'path',
                name: 'relatedResource',
                type: 'string',
                validation: [
                  'required',
                  `in:${resource.data.fields
                    .filter(field => field.isRelationshipField)
                    .map(field => field.databaseField)
                    .join(',')}`
                ],
                description: `The slug path of the related resource you want to fetch.`
              },
              ...paginationParameters(resource)
            ])
            .group(resource.data.label)
            .id(`index_${singular}_relations`)
            .internal()
            .resource(resource)
            .description(
              `This endpoint figures out the relationship passed as /:relatedResource (one-to-one, one-to-many, many-to-many, or many-to-one) and returns all related entities. The result will be a paginated array for many-to-* relations and an object for one-to-* relations.`
            )
            .path(getApiPath(`${plural}/:id/:relatedResource`))
            .handle(
              async (
                { manager, params, query, userInputError, config },
                response
              ) => {
                const whereOptions = parseQueryToWhereOptions(query)
                const findOptions = parseQueryToFindOptions(query, resource)

                const relatedField = resource.data.fields.find(
                  f => f.databaseField === params.relatedResource
                )

                if (!relatedField) {
                  throw userInputError(
                    `Invalid related resource ${params.relatedResource}`
                  )
                }

                const relatedResource = resources.find(
                  resource =>
                    resource.data.pascalCaseName ===
                    relatedField.relatedProperty.type
                )!

                if (
                  relatedField.relatedProperty.reference ===
                  ReferenceType.ONE_TO_MANY
                ) {
                  const relatedManyToOne = relatedResource.data.fields.find(
                    f =>
                      f.relatedProperty.type === resource.data.pascalCaseName &&
                      f.relatedProperty.reference === ReferenceType.MANY_TO_ONE
                  )!

                  const [results, count] = await manager.findAndCount(
                    relatedResource.data.pascalCaseName,
                    {
                      [relatedManyToOne.databaseField]: params.id,
                      ...whereOptions
                    },
                    findOptions
                  )

                  return response.formatter.ok(
                    results,
                    this.getPageMetaFromFindOptions(count, findOptions)
                  )
                }

                if (
                  relatedField.relatedProperty.reference ===
                  ReferenceType.MANY_TO_MANY
                ) {
                  const relatedManyToMany = relatedResource.data.fields.find(
                    f =>
                      f.relatedProperty.type === resource.data.pascalCaseName &&
                      f.relatedProperty.reference === ReferenceType.MANY_TO_MANY
                  )!

                  const [results, count] = await manager.findAndCount(
                    relatedResource.data.pascalCaseName,
                    {
                      [relatedManyToMany.databaseField]: {
                        $in: [params.id]
                      },
                      ...whereOptions
                    },
                    findOptions
                  )

                  return response.formatter.ok(
                    results,
                    this.getPageMetaFromFindOptions(count, findOptions)
                  )
                }

                if (
                  relatedField.relatedProperty.reference ===
                    ReferenceType.MANY_TO_ONE ||
                  relatedField.relatedProperty.reference ===
                    ReferenceType.ONE_TO_ONE
                ) {
                  const payload = ((await manager.findOneOrFail(
                    resource.data.pascalCaseName,
                    {
                      id: params.id
                    },
                    {
                      populate: [relatedField.databaseField]
                    }
                  )) as any)[relatedField.databaseField]

                  if (!payload) {
                    return response.formatter.ok(null)
                  }

                  manager.clear()

                  const result = await manager.findOne(
                    relatedResource.data.pascalCaseName,
                    {
                      id: payload.id
                    },
                    findOptions
                  )

                  return response.formatter.ok(result)
                }
              }
            )
        )

      !resource.isHiddenOnApi() &&
        !resource.data.hideOnUpdateApi &&
        routes.push(
          route(`Update multiple ${plural}`)
            .patch()
            .internal()
            .middleware([
              authorizeMiddleware(
                resource.authorizeCallbacks.authorizedToUpdate
              )
            ])
            .parameters([
              {
                in: 'body',
                type: 'array',
                description: `Array of ${plural} objects`,
                name: 'objects'
              },
              {
                in: 'body',
                type: 'object',
                description: `Where query to find ${plural} to be updated.`,
                name: 'where'
              }
            ])
            .group(resource.data.label)
            .id(this.getRouteId(`update_${plural}`))
            .resource(resource)
            .description(
              `This endpoint update multiple ${plural}. Provide a where query matching all the objects you want to update.`
            )
            .path(getApiPath(`${plural}/bulk`))
            .handle(
              async (
                {
                  manager,
                  body,
                  entity,
                  resources: resourcesMap,
                  userInputError,
                  config
                },
                response
              ) => {
                if (!body?.object) {
                  throw userInputError('Validation failed.', {
                    errors: [
                      {
                        message: 'The object field is required.',
                        field: 'object',
                        validation: 'required'
                      }
                    ]
                  })
                }

                if (!body?.where) {
                  throw userInputError('Validation failed.', {
                    errors: [
                      {
                        message: 'The where field is required.',
                        field: 'where',
                        validation: 'required'
                      }
                    ]
                  })
                }

                const data = await manager.find(
                  resource.data.pascalCaseName,
                  parseQueryToWhereOptions({
                    where: body.where
                  })
                )

                const results = await Promise.all(
                  data.map(row =>
                    Utils.validator(resource, manager, resourcesMap, row.id)
                      .request(request)
                      .validate(body.object, false)
                  )
                )

                if (
                  results.filter(([passed]) => passed).length !== results.length
                ) {
                  throw userInputError('Validation failed.', {
                    errors: results
                      .map(([passed, payload], index) => [
                        passed,
                        payload,
                        index
                      ])
                      .filter(([passed]) => !passed)
                      .map(([, errors, index]) => ({
                        errors,
                        index
                      }))
                  })
                }

                data.forEach(d => manager.assign(d, body.object))

                await manager.persistAndFlush(data)

                config.emitter.emit(`${singular}::updated`, data)

                return response.formatter.ok(data)
              }
            )
        )

      !resource.isHiddenOnApi() &&
        !resource.data.hideOnUpdateApi &&
        routes.push(
          route(`Update single ${singular}`)
            .patch()
            .internal()
            .middleware([
              findSingleEntityMiddleware(resource),
              authorizeMiddleware(
                resource.authorizeCallbacks.authorizedToUpdate
              )
            ])
            .parameters(
              resource.data.fields
                .filter(
                  field =>
                    !field.showHideFieldFromApi.hideOnUpdateApi &&
                    !['id', '_id', 'created_at', 'updated_at'].includes(
                      field.databaseField
                    )
                )
                .map(field => ({
                  in: 'body',
                  name: field.databaseField,
                  description: field.helpText,
                  validation: field.creationValidationRules.concat(
                    field.validationRules
                  ),
                  type: field.relatedProperty.type || field.property.type!
                }))
            )
            .group(resource.data.label)
            .id(this.getRouteId(`update_${singular}`))
            .resource(resource)
            .description(
              `This endpoint update a single ${singular}. Provide the primary key ID of the ${singular} you want to update.`
            )
            .path(getApiPath(`${plural}/:id`))
            .handle(
              async (
                {
                  manager,
                  params,
                  body,
                  query,
                  entity,
                  resources: resourcesMap,
                  userInputError,
                  config
                },
                response
              ) => {
                const [passed, payload] = await Utils.validator(
                  resource,
                  manager,
                  resourcesMap,
                  params.id
                ).validate(body, false)

                if (!passed) {
                  throw userInputError('Validation failed.', {
                    errors: payload
                  })
                }

                manager.assign(entity, body)

                await manager.persistAndFlush(entity)

                config.emitter.emit(`${singular}::updated`, entity)

                return response.formatter.ok(entity)
              }
            )
        )

      !resource.isHiddenOnApi() &&
        !resource.data.hideOnDeleteApi &&
        routes.push(
          route(`Delete single ${singular}`)
            .delete()
            .internal()
            .middleware([
              findSingleEntityMiddleware(resource),
              authorizeMiddleware(
                resource.authorizeCallbacks.authorizedToDelete
              )
            ])
            .parameters([
              {
                in: 'path',
                name: 'id',
                type: 'number',
                validation: ['required'],
                description: `The ID of the ${singular} to delete.`
              }
            ])
            .group(resource.data.label)
            .id(this.getRouteId(`delete_${singular}`))
            .resource(resource)
            .path(getApiPath(`${plural}/:id`))
            .extend({
              docs: {
                summary: `Delete a single ${singular}`,
                description: `This endpoint deletes a single ${singular}. Provide the primary key ID of the entity you want to delete.`
              }
            })
            .handle(async ({ manager, params, entity, config }, response) => {
              const modelRepository = manager.getRepository(
                modelName as EntityName<AnyEntity<any>>
              )

              await modelRepository.removeAndFlush(entity)

              config.emitter.emit(`${singular}::deleted`, [entity])

              return response.formatter.ok(entity)
            })
        )

      !resource.isHiddenOnApi() &&
        !resource.data.hideOnDeleteApi &&
        routes.push(
          route(`Delete multiple ${plural}`)
            .delete()
            .group(resource.data.label)
            .internal()
            .middleware([
              authorizeMiddleware(
                resource.authorizeCallbacks.authorizedToDelete
              )
            ])
            .id(this.getRouteId(`delete_many_${singular}`))
            .resource(resource)
            .path(getApiPath(`${plural}`))
            .description(
              `This endpoint deletes multiple ${plural}. Provide a search query to find all ${plural} to be deleted.`
            )
            .handle(async ({ manager, query, config }, response) => {
              const entities = await manager.find(
                modelName,
                parseQueryToWhereOptions(query)
              )

              await manager.removeAndFlush(entities)

              config.emitter.emit(`${singular}::deleted`, entities)

              return response.formatter.ok(entities)
            })
        )
    })

    return routes
  }

  plugin() {
    return plugin('Rest API')
      .extra({
        path: this.path
      })
      .register(config => {
        const { app, resources, extendRoutes } = config

        app.use(responseEnhancer())

        extendRoutes(
          this.extendRoutes(resources, (path: string) =>
            this.getApiPath(path)
          ).map(route =>
            route.middleware([
              (request, response, next) => {
                // register filters
                resources.forEach(resource => {
                  resource.data.filters.forEach(filter => {
                    request.manager.addFilter(
                      filter.config.shortName,
                      (args: DataPayload, type: 'read' | 'update' | 'delete') =>
                        filter.config.cond(args, request, type),
                      resource.data.pascalCaseName,
                      filter.config.default
                    )
                  })
                })

                // set filter parameters
                resources.forEach(resource => {
                  resource.data.filters.forEach(filter => {
                    const filterFromBody = (request.query as any)?.filters?.find(
                      (bodyFitler: any) =>
                        bodyFitler.name === filter.config.shortName
                    )

                    request.manager.setFilterParams(
                      filter.config.shortName,
                      filterFromBody?.args || {}
                    )
                  })
                })

                next()
              }
            ])
          )
        )

        extendRoutes([
          route('Fetch SDK Types')
            .path('sdk/types')
            .handle(async (request, response) => {
              return response.json(
                (
                  await Promise.all([
                    generateResourceInterfaces(config),
                    generateFetchWrapperForResources(config)
                  ])
                )
                  .map(type => formatContent(type))
                  .join('\n')
              )
            })
        ])
      })
  }
}

export const rest = () => new Rest()

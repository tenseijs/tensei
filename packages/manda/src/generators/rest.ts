import { PluginSetupConfig, ResourceContract } from '@tensei/common'
import { PluginContract } from '@tensei/common/plugins'
import { generateAuthApi } from './auth'

const generateApiClassForResource = (resource: ResourceContract, path: string) => {
	if (resource.data.hideOnApi) {
		return ``
	}

	const apiPrefix = `${path}/`

	return `
        export class ${resource.data.pascalCaseName}API {
            constructor(private options: SdkOptions, private instance: AxiosInstance) {}

            ${
							resource.data.hideOnFetchApi
								? ''
								: `
            /**
             * 
             * Fetch a single ${resource.data.pascalCaseName.toLowerCase()} from the API.
             *    Example:
             *      await tensei.${resource.data.camelCaseNamePlural}().find({ id })
             * 
             **/
            find(payload: {
                id: Tensei.${resource.data.pascalCaseName}['id'],
                select?: Tensei.${resource.data.pascalCaseName}SelectFields[],
                populate?: Tensei.${resource.data.pascalCaseName}PopulateFields[],
            }) {
                return this.instance.get<Tensei.FindResponse<Tensei.${
									resource.data.pascalCaseName
								}>>('${apiPrefix}' + '${resource.data.slugPlural}/' + payload.id)
            }

            /**
             * 
             * Fetch a paginated list of ${resource.data.camelCaseNamePlural} from the API.
             *    Example:
             *      await tensei.${resource.data.camelCaseNamePlural}.findMany({
             *          where: { id: { _in: [1, 2] } },
             *          sort: { id: SortQueryInput.ASC },
             *          pagination: { per_page: 30, page: 1 },
             *      })
             *
             **/
            findMany(payload: {
                where?: Tensei.${resource.data.pascalCaseName}WhereQueryInput,
                sort?: Tensei.${resource.data.pascalCaseName}SortQueryInput,
                pagination?: Tensei.PaginationOptions,
                fields?: Tensei.${resource.data.pascalCaseName}SelectFields[],
                populate?: Tensei.${resource.data.pascalCaseName}PopulateFields[]
            } = {}) {
                return this.instance.get<Tensei.PaginatedResponse<Tensei.${
									resource.data.pascalCaseName
								}>>('${apiPrefix}' + '${resource.data.slugPlural}', {
                                    params: {
                                        populate: payload?.populate?.join(',') || [],
                                        per_page: payload?.pagination?.per_page,
                                        page: payload?.pagination?.page,
                                        fields: payload?.fields?.join(',') || undefined,
                                        where: payload?.where
                                    }
                                })
            }
            `
						}

            ${
							resource.data.hideOnInsertApi
								? ''
								: `
            /**
             * 
             * Insert a single ${resource.data.pascalCaseName.toLowerCase()}.
             *    Example:
             *      await tensei.${resource.data.camelCaseNamePlural}.insert({ object: {...} })
             *
             **/
            insert(payload: {
                object: Tensei.${resource.data.pascalCaseName}InsertInput
            }) {
                return this.instance.post<Tensei.FindResponse<Tensei.${
									resource.data.pascalCaseName
								}>>('${apiPrefix}' + '${resource.data.slugPlural}', payload.object)
            }

            /**
             * 
             * Insert multiple ${resource.data.camelCaseNamePlural}.
             *    Example:
             *      await tensei.${
								resource.data.camelCaseNamePlural
							}.insertMany({ objects: [{...}, {...}] })
             *
             **/
            insertMany(payload: {
                objects: Tensei.${resource.data.pascalCaseName}InsertInput[]
            }) {
                return this.instance.post<Tensei.FindResponse<Tensei.${
									resource.data.pascalCaseName
								}[]>>('${apiPrefix}' + '${resource.data.slugPlural}/bulk', payload)
            }
            `
						}

            ${
							resource.data.hideOnUpdateApi
								? ''
								: `
            /**
             * 
             * Update a single ${resource.data.pascalCaseName.toLowerCase()}.
             *    Example:
             *      await tensei.${
								resource.data.camelCaseNamePlural
							}.update({ id: 1, object: {...} })
             *
             **/
            update(payload: {
                id: Tensei.${resource.data.pascalCaseName}['id']
                object: Tensei.${resource.data.pascalCaseName}UpdateInput
            }) {
                return this.instance.patch<Tensei.FindResponse<Tensei.${
									resource.data.pascalCaseName
								}>>('${apiPrefix}' + '${resource.data.slugPlural}/' + payload.id, payload.object)
            }

            /**
             * 
             * Update multiple ${resource.data.camelCaseNamePlural}.
             *    Example:
             *      await tensei.${resource.data.camelCaseNamePlural}.updateMany({
             *          where: { id: { _in: [1, 2] } },
             *          object: {...},
             *      })
             *
             **/
            updateMany(payload: {
                object: Tensei.${resource.data.pascalCaseName}UpdateInput,
                where: Tensei.${resource.data.pascalCaseName}WhereQueryInput
            }) {
                return this.instance.patch('${apiPrefix}' + '${
										resource.data.slugPlural
								  }/bulk', payload) as Promise<Tensei.FindResponse<Tensei.${
										resource.data.pascalCaseName
								  }[]>>
            }
            `
						}

            ${
							resource.data.hideOnDeleteApi
								? ''
								: `
            /**
             * 
             * Delete single ${resource.data.camelCaseNamePlural}.
             *    Example:
             *      await tensei.${resource.data.camelCaseNamePlural}.delete({
             *          id: 1
             *      })
             *
             **/
            delete(payload: {
                id: Tensei.${resource.data.pascalCaseName}['id']
            }) {
                return this.instance.delete('${apiPrefix}' + '${resource.data.slugPlural}' + payload.id) as Promise<Tensei.FindResponse<Tensei.${resource.data.pascalCaseName}>>
            }

            /**
             * 
             * Delete multiple ${resource.data.camelCaseNamePlural}.
             *    Example:
             *      await tensei.${resource.data.camelCaseNamePlural}.deleteMany({
             *          where: { id: { _in: [1, 2] } },
             *      })
             *
             **/
            deleteMany(payload: {
                where: Tensei.${resource.data.pascalCaseName}WhereQueryInput
            }) {
                return this.instance.delete('${apiPrefix}' + '${resource.data.slugPlural}', {
                    params: {
                        where: payload.where
                    }
                }) as Promise<Tensei.FindResponse<Tensei.${resource.data.pascalCaseName}[]>>
            }
            `
						}
        }
    `
}

const generateAPIClient = (resources: ResourceContract[], plugins: PluginContract[]) => {
	const authPlugin = plugins.find((plugin) => plugin.config.name === 'Auth')

	return `
    export interface SdkOptions {
        url?: string
        axiosInstance?: AxiosInstance
        axiosRequestConfig?: Omit<AxiosRequestConfig, 'baseURL'>
    }

    export class Sdk {
        private instance: AxiosInstance
        ${resources
					.filter((resource) => !resource.data.hideOnApi)
					.map(
						(resource) =>
							`public ${resource.data.camelCaseNamePlural} : ${resource.data.pascalCaseName}API\n`
					)
					.join('')}

        ${authPlugin ? 'public auth: AuthAPI\n' : ''}

        constructor(private options?: SdkOptions) {
            this.instance = options?.axiosInstance || Axios.create({
                baseURL: this.options?.url || 'http://localhost:8810',
                ...(options?.axiosRequestConfig || {})
            })

            ${authPlugin ? 'this.auth = new AuthAPI(this.instance)' : ''}
            ${resources
							.filter((resource) => !resource.data.hideOnApi)
							.map((resource) => {
								return `this.${resource.data.camelCaseNamePlural} =  new ${resource.data.pascalCaseName}API(this.options, this.instance)
        `
							})
							.join('')}
        }
    }
`
}

const generateImports = () => {
	return `
    import * as Tensei from './interfaces'
    import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

    export * from './interfaces'
    `
}

export const generateFetchWrapperForResources = (config: PluginSetupConfig) => {
	const { resources, plugins } = config

	const restPlugin = plugins.find((plugin) => plugin.config.name === 'Rest API')

	if (!restPlugin) {
		return ``
	}

	const path = restPlugin.config.extra?.path || 'api'

	return (
		[generateImports(), generateAPIClient(resources, plugins), generateAuthApi(config)]
			.concat(
				resources.map(
					(resource) => `
        ${generateApiClassForResource(resource, path)}
    `
				)
			)
			// .concat([generateAPIClient(resources)])
			.join('')
	)
}

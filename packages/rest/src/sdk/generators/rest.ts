import { PluginSetupConfig, ResourceContract } from '@tensei/common'
import { PluginContract } from '@tensei/common/plugins'
import { generateAuthApi } from './auth'

const generateApiClassForResource = (
  resource: ResourceContract,
  path: string
) => {
  if (resource.data.hideOnApi) {
    return ``
  }

  const apiPrefix = `${path}/`

  return `
        export interface ${resource.data.pascalCaseName}SdkContract {
            ${
              resource.data.hideOnFetchApi
                ? ''
                : `
            /**
             * 
             * Fetch a single ${resource.data.pascalCaseName.toLowerCase()} from the API.
             *    Example:
             *      await tensei.${
               resource.data.camelCaseNamePlural
             }().find({ id })
             * 
             **/
            find(payload: {
                id: ${resource.data.pascalCaseName}['id'],
                select?: ${resource.data.pascalCaseName}SelectFields[],
                populate?: ${resource.data.pascalCaseName}PopulateFields[],
            }): Promise<FindResponse<${resource.data.pascalCaseName}>>

            /**
             * 
             * Fetch a paginated list of ${
               resource.data.camelCaseNamePlural
             } from the API.
             *    Example:
             *      await tensei.${resource.data.camelCaseNamePlural}.findMany({
             *          where: { id: { _in: [1, 2] } },
             *          sort: { id: SortQueryInput.ASC },
             *          pagination: { per_page: 30, page: 1 },
             *      })
             *
             **/
            findMany(payload?: {
                where?: ${resource.data.pascalCaseName}WhereQueryInput,
                sort?: ${resource.data.pascalCaseName}SortQueryInput,
                pagination?: PaginationOptions,
                fields?: ${resource.data.pascalCaseName}SelectFields[],
                populate?: ${resource.data.pascalCaseName}PopulateFields[]
            }): Promise<PaginatedResponse<${resource.data.pascalCaseName}>>
            `
            }

            ${
              resource.data.hideOnCreateApi
                ? ''
                : `
            /**
             * 
             * Create a single ${resource.data.pascalCaseName.toLowerCase()}.
             *    Example:
             *      await tensei.${
               resource.data.camelCaseNamePlural
             }.create({ object: {...} })
             *
             **/
            create(payload: {
                object: ${resource.data.pascalCaseName}CreateInput
            }): Promise<FindResponse<${resource.data.pascalCaseName}>>

            /**
             * 
             * Create multiple ${resource.data.camelCaseNamePlural}.
             *    Example:
             *      await tensei.${
               resource.data.camelCaseNamePlural
             }.createMany({ objects: [{...}, {...}] })
             *
             **/
            createMany(payload: {
                objects: ${resource.data.pascalCaseName}CreateInput[]
            }): Promise<FindResponse<${resource.data.pascalCaseName}[]>>
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
                id: ${resource.data.pascalCaseName}['id']
                object: ${resource.data.pascalCaseName}UpdateInput
            }): Promise<FindResponse<${resource.data.pascalCaseName}>>

            /**
             * 
             * Update multiple ${resource.data.camelCaseNamePlural}.
             *    Example:
             *      await tensei.${
               resource.data.camelCaseNamePlural
             }.updateMany({
             *          where: { id: { _in: [1, 2] } },
             *          object: {...},
             *      })
             *
             **/
            updateMany(payload: {
                object: ${resource.data.pascalCaseName}UpdateInput,
                where: ${resource.data.pascalCaseName}WhereQueryInput
            }): Promise<FindResponse<${resource.data.pascalCaseName}[]>>
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
                id: ${resource.data.pascalCaseName}['id']
            }): Promise<FindResponse<${resource.data.pascalCaseName}>>

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
                where: ${resource.data.pascalCaseName}WhereQueryInput
            }): Promise<FindResponse<${resource.data.pascalCaseName}[]>>
            `
            }
        }
    `
}

const generateAPIClient = (
  resources: ResourceContract[],
  plugins: PluginContract[]
) => {
  const authPlugin = plugins.find(plugin => plugin.config.name === 'Auth')

  return `
    export interface SdkOptions {
        url?: string
        refreshTokens?: boolean
        axiosInstance?: AxiosInstance
        axiosRequestConfig?: Omit<AxiosRequestConfig, 'baseURL'>
    }

    export interface SdkContract {
        ${resources
          .filter(resource => !resource.data.hideOnApi)
          .map(
            resource =>
              `${resource.data.camelCaseNamePlural}() : ${resource.data.pascalCaseName}SdkContract\n`
          )
          .join('')}

        ${authPlugin ? 'auth(): AuthSdkContract\n' : ''}
        options?: SdkOptions
    }

    export const sdk: (options?: SdkOptions) => SdkContract
`
}

const generateImports = () => {
  return `
    import { AxiosInstance, AxiosRequestConfig } from 'axios'
    `
}

export const generateFetchWrapperForResources = (config: PluginSetupConfig) => {
  const { resources, plugins } = config

  const restPlugin = plugins.find(plugin => plugin.config.name === 'Rest API')

  if (!restPlugin) {
    return ``
  }

  const path = restPlugin.config.extra?.path || 'api'

  return (
    [
      generateImports(),
      generateAPIClient(resources, plugins),
      generateAuthApi(config)
    ]
      .concat(
        resources.map(
          resource => `
        ${generateApiClassForResource(resource, path)}
    `
        )
      )
      // .concat([generateAPIClient(resources)])
      .join('')
  )
}

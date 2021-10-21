declare module '@tensei/common/resources' {
  import { Request, RequestHandler } from 'express'
  import { FilterContract } from '@tensei/common/filters'
  import { SerializedField, FieldContract } from '@tensei/common/fields'
  import { SerializedAction, ActionContract } from '@tensei/common/actions'
  import {
    HookFunction,
    HookFunctionPromised,
    Permission,
    AuthorizeFunction,
    FlushHookFunction,
    DatabaseRepositoryInterface,
    User,
    DataPayload,
    ResourceHelpers,
    GraphQlMiddleware,
    ExpressMiddleware
  } from '@tensei/common/config'
  import { ActionResponse } from '@tensei/common/actions'
  export interface ValidationMessages {
    [key: string]: string
  }
  export type SupportedIcons = string
  export type ResourceMethod = (ctx: Config) => any
  export interface RepositoryMethod<Fn extends ResourceMethod> {
    fn: Fn
    name: string
  }
  export interface ResourceData<T extends ApiType = 'rest'> {
    name: string
    table: string
    icon: SupportedIcons
    group: string
    enableAutoFilters: boolean
    enableAutoFills: boolean
    slug: string
    label: string
    groupSlug: string
    valueField: string
    hideOnApi?: boolean
    methods: RepositoryMethod[]
    repositoryMethods: RepositoryMethod[]
    hideOnCreateApi: boolean
    hideOnFetchApi: boolean
    hideOnUpdateApi: boolean
    hideOnDeleteApi: boolean
    hideOnInsertSubscription: boolean
    hideOnUpdateSubscription: boolean
    hideOnDeleteSubscription: boolean
    camelCaseName: string
    displayField: string
    displayFieldSnakeCase: string
    secondaryDisplayField: string
    secondaryDisplayFieldSnakeCase: string
    description: string
    snakeCaseName: string
    snakeCaseNamePlural: string
    noTimestamps: boolean
    pascalCaseName: string
    pascalCaseNamePlural: string
    slugSingular: string
    slugPlural: string
    perPageOptions: number[]
    permissions: Permission[]
    filters: FilterContract[]
    camelCaseNamePlural: string
    displayInNavigation: boolean
    validationMessages: ValidationMessages
    extend: ResourceExtendContract
    createMiddleware: MiddlewareFn<T>[]
    fetchMiddleware: MiddlewareFn<T>[]
    updateMiddleware: MiddlewareFn<T>[]
    deleteMiddleware: MiddlewareFn<T>[]
  }
  interface ResourceDataWithFields<T extends ApiType = 'rest'>
    extends ResourceData<T> {
    fields: FieldContract[]
    actions: ActionContract[]
  }
  export interface SerializedResource<T extends ApiType = 'rest'>
    extends Partial<ResourceData<T>> {
    fields: SerializedField[]
    actions: SerializedAction[]
  }

  export interface ResourceExtendContract extends any {}

  export type ApiType = 'rest' | 'graphql'

  export type MiddlewareFn<T extends ApiType = 'rest'> = T extends 'rest'
    ? ExpressMiddleware
    : GraphQlMiddleware

  export interface ResourceContract<T extends ApiType = 'rest'> {
    authorizeCallbacks: {
      authorizedToShow: AuthorizeFunction[]
      authorizedToFetch: AuthorizeFunction[]
      authorizedToCreate: AuthorizeFunction[]
      authorizedToUpdate: AuthorizeFunction[]
      authorizedToDelete: AuthorizeFunction[]
      authorizedToRunAction: AuthorizeFunction[]
      authorizedToFetchRelation: AuthorizeFunction[]
    }
    dashboardAuthorizeCallbacks: {
      authorizedToShow: AuthorizeFunction[]
      authorizedToFetch: AuthorizeFunction[]
      authorizedToCreate: AuthorizeFunction[]
      authorizedToUpdate: AuthorizeFunction[]
      authorizedToDelete: AuthorizeFunction[]
      authorizedToRunAction: AuthorizeFunction[]
    }
    hooks: {
      onInit: HookFunction[]
      beforeCreate: (HookFunction | HookFunctionPromised)[]
      afterCreate: (HookFunction | HookFunctionPromised)[]
      beforeUpdate: (HookFunction | HookFunctionPromised)[]
      afterUpdate: (HookFunction | HookFunctionPromised)[]
      beforeDelete: (HookFunction | HookFunctionPromised)[]
      afterDelete: (HookFunction | HookFunctionPromised)[]
      beforeFlush: FlushHookFunction[]
      onFlush: FlushHookFunction[]
      afterFlush: FlushHookFunction[]
    }
    data: ResourceDataWithFields<T>
    hideOnApi(): this
    icon(icon: SupportedIcons): this
    isHiddenOnApi(): boolean
    hideOnCreateApi(): this
    method<Fn = ResourceMethod>(name: string, fn: Fn): this
    repositoryMethod<Fn = ResourceMethod>(name: string, fn: Fn): this
    hideOnUpdateApi(): this
    hideOnDeleteApi(): this
    hideOnFetchApi(): this
    enableAutoFills(): this
    enableAutoFilters(): this
    showOnInsertSubscription(): this
    showOnUpdateSubscription(): this
    showOnDeleteSubscription(): this
    getPrimaryField(): FieldContract | undefined
    getCreateApiExposedFields(): FieldContract[]
    getUpdateApiExposedFields(): FieldContract[]
    getFetchApiExposedFields(): FieldContract[]
    extend(extend: ResourceExtendContract): this
    filters(filters: FilterContract[]): this
    permissions(permissions: Permission[]): this
    canFetchRelation(authorizeFunction: AuthorizeFunction): this
    canShow(authorizeFunction: AuthorizeFunction): this

    createMiddleware(middlewareFn: MiddlewareFn<T>[]): this
    fetchMiddleware(middlewareFn: MiddlewareFn<T>[]): this
    updateMiddleware(middlewareFn: MiddlewareFn<T>[]): this
    deleteMiddleware(middlewareFn: MiddlewareFn<T>[]): this

    canFetch(authorizeFunction: AuthorizeFunction): this
    canCreate(authorizeFunction: AuthorizeFunction): this
    canUpdate(authorizeFunction: AuthorizeFunction): this
    canDelete(authorizeFunction: AuthorizeFunction): this
    canRunAction(authorizeFunction: AuthorizeFunction): this
    canShowOnDashboard(authorizeFunction: AuthorizeFunction): this
    canFetchOnDashboard(authorizeFunction: AuthorizeFunction): this
    canCreateOnDashboard(authorizeFunction: AuthorizeFunction): this
    canUpdateOnDashboard(authorizeFunction: AuthorizeFunction): this
    canDeleteOnDashboard(authorizeFunction: AuthorizeFunction): this
    canRunActionOnDashboard(authorizeFunction: AuthorizeFunction): this
    displayField(displayField: string): this
    secondaryDisplayField(displayField: string): this
    fields(fields: FieldContract[]): this
    actions(actions: ActionContract[]): this
    noTimestamps(): this
    perPageOptions(perPageOptions: number[]): this
    displayInNavigation(): this
    hideFromNavigation(): this
    validationMessages(validationMessages: ValidationMessages): this
    group(groupName: string): this
    slug(slug: string): this
    label(label: string): this
    serialize(): SerializedResource<T>
    beforeCreate(hook: HookFunction | HookFunctionPromised): this
    afterCreate(hook: HookFunction | HookFunctionPromised): this
    beforeUpdate(hook: HookFunction | HookFunctionPromised): this
    afterUpdate(hook: HookFunction | HookFunctionPromised): this
    beforeDelete(hook: HookFunction | HookFunctionPromised): this
    afterDelete(hook: HookFunction | HookFunctionPromised): this
    onInit(hook: HookFunction): this
  }

  export class Resource<T extends ApiType = 'rest'>
    implements ResourceContract<T> {
    authorizeCallbacks: {
      authorizedToShow: AuthorizeFunction[]
      authorizedToFetch: AuthorizeFunction[]
      authorizedToCreate: AuthorizeFunction[]
      authorizedToUpdate: AuthorizeFunction[]
      authorizedToDelete: AuthorizeFunction[]
      authorizedToRunAction: AuthorizeFunction[]
    }
    dashboardAuthorizeCallbacks: {
      authorizedToShow: AuthorizeFunction[]
      authorizedToFetch: AuthorizeFunction[]
      authorizedToCreate: AuthorizeFunction[]
      authorizedToUpdate: AuthorizeFunction[]
      authorizedToDelete: AuthorizeFunction[]
      authorizedToRunAction: AuthorizeFunction[]
    }
    hooks: {
      beforeCreate: HookFunction
      beforeUpdate: HookFunction
      afterCreate: HookFunction
      afterUpdate: HookFunction
    }
    data: ResourceDataWithFields
    hideOnApi(): this
    isHiddenOnApi(): boolean
    hideOnCreateApi(): this
    method<Fn = ResourceMethod>(name: string, fn: Fn): this
    repositoryMethod<Fn = ResourceMethod>(name: string, fn: Fn): this
    hideOnUpdateApi(): this
    hideOnDeleteApi(): this
    hideOnFetchApi(): this
    getCreateApiExposedFields(): FieldContract[]
    getUpdateApiExposedFields(): FieldContract[]
    getFetchApiExposedFields(): FieldContract[]
    filters(filters: FilterContract[]): this
    permissions(permissions: Permission[]): this
    canShow(authorizeFunction: AuthorizeFunction): this
    canFetch(authorizeFunction: AuthorizeFunction): this
    canCreate(authorizeFunction: AuthorizeFunction): this
    canUpdate(authorizeFunction: AuthorizeFunction): this
    canDelete(authorizeFunction: AuthorizeFunction): this
    canRunAction(authorizeFunction: AuthorizeFunction): this
    canShowOnDashboard(authorizeFunction: AuthorizeFunction): this
    canFetchOnDashboard(authorizeFunction: AuthorizeFunction): this
    canCreateOnDashboard(authorizeFunction: AuthorizeFunction): this
    canUpdateOnDashboard(authorizeFunction: AuthorizeFunction): this
    canDeleteOnDashboard(authorizeFunction: AuthorizeFunction): this
    canRunActionOnDashboard(authorizeFunction: AuthorizeFunction): this
    displayField(displayField: string): this
    fields(fields: FieldContract[]): this
    actions(actions: ActionContract[]): this
    noTimestamps(): this
    perPageOptions(perPageOptions: number[]): this
    displayInNavigation(): this
    hideFromNavigation(): this
    validationMessages(validationMessages: ValidationMessages): this
    group(groupName: string): this
    slug(slug: string): this
    label(label: string): this
    serialize(): SerializedResource<T>
    beforeCreate(hook: HookFunction): this
    beforeUpdate(hook: HookFunction): this
    afterCreate(hook: HookFunction): this
    afterUpdate(hook: HookFunction): this
  }

  export const resource: <T extends ApiType = 'rest'>(
    name: string,
    tableName?: string | undefined
  ) => ResourceContract<T>

  export interface ManagerContract {
    repository: DatabaseRepositoryInterface
    aggregateCount(between: [string, string]): Promise<number>
    aggregateMax(between: [string, string], columns: string[]): Promise<number>
    aggregateMin(between: [string, string], columns: string[]): Promise<number>
    aggregateAvg(between: [string, string], columns: string[]): Promise<number>
    deleteById(id: number | string): Promise<any>
    create(payload: DataPayload): Promise<any>
    database(resource?: ResourceContract): DatabaseRepositoryInterface
    authorize(
      authorizeFn: keyof ResourceContract['dashboardAuthorizeCallbacks'],
      model?: any,
      resource?: ResourceContract
    ): Promise<void>
    updateOneByField(
      databaseField: string,
      value: any,
      payload: DataPayload
    ): Promise<any>
    update(
      id: number | string,
      payload: DataPayload,
      patch?: boolean
    ): Promise<any>
    validateRequestQuery(
      {
        perPage,
        page,
        fields,
        search,
        filter,
        with: withRelationships,
        noPagination
      }: Request['query'],
      resource?: ResourceContract
    ): Promise<any>
    findAll(
      query?: FetchAllRequestQuery
    ): Promise<import('@tensei/common').FetchAllResults<{}>>
    findAllRelatedResource(
      resourceId: string | number,
      relatedResourceSlugOrResource: string | ResourceContract
    ): Promise<{}>
    findOneById(id: number | string, withRelated?: string[]): Promise<any>
    getValidationRules: (
      creationRules?: boolean
    ) => {
      [key: string]: string
    }
    getResourceFieldsFromPayload: (payload: DataPayload) => DataPayload
    breakFieldsIntoRelationshipsAndNonRelationships: (
      payload: DataPayload
    ) => {
      relationshipFieldsPayload: DataPayload
      nonRelationshipFieldsPayload: DataPayload
    }
    validate: (
      payload: DataPayload,
      creationRules?: boolean,
      modelId?: string | number | undefined,
      resource?: ResourceContract
    ) => Promise<DataPayload>
    validateUniqueFields: (
      payload: DataPayload,
      creationRules?: boolean,
      modelId?: string | number | undefined,
      resource?: ResourceContract
    ) => Promise<void>
    validateRelationshipFields: (payload: DataPayload) => Promise<void>
    runAction: (
      actionSlug: string,
      payload?: DataPayload
    ) => Promise<ActionResponse>
    findAllCount: () => Promise<number>
    getFieldFromResource: (
      resource: ResourceContract,
      databaseField: string
    ) => import('@tensei/common').FieldContract | undefined
    setResource: (resourceOrSlug: ResourceContract | string) => this
    findResource: (resourceSlug: string | ResourceContract) => ResourceContract
    findOneByField: (databaseField: string, value: any) => Promise<any>
  }

  export declare class Manager implements ManagerContract {
    constructor(
      request: Request | null,
      resources: ResourceContract[],
      database: DatabaseRepositoryInterface
    )
    repository: DatabaseRepositoryInterface
    aggregateCount(between: [string, string]): Promise<number>
    aggregateMax(between: [string, string], columns: string[]): Promise<number>
    aggregateMin(between: [string, string], columns: string[]): Promise<number>
    aggregateAvg(between: [string, string], columns: string[]): Promise<number>
    deleteById(id: number | string): Promise<any>
    create(payload: DataPayload): Promise<any>
    database(resource?: ResourceContract): DatabaseRepositoryInterface
    authorize(
      authorizeFn: keyof ResourceContract['dashboardAuthorizeCallbacks'],
      model?: any,
      resource?: ResourceContract
    ): Promise<void>
    updateOneByField(
      databaseField: string,
      value: any,
      payload: DataPayload
    ): Promise<any>
    update(
      id: number | string,
      payload: DataPayload,
      patch?: boolean
    ): Promise<any>
    validateRequestQuery(
      {
        perPage,
        page,
        fields,
        search,
        filter,
        with: withRelationships,
        noPagination
      }: Request['query'],
      resource?: ResourceContract
    ): Promise<any>
    findAll(
      query?: undefined
    ): Promise<import('@tensei/common').FetchAllResults<{}>>
    findAllRelatedResource(
      resourceId: string | number,
      relatedResourceSlugOrResource: string | ResourceContract
    ): Promise<{}>
    findOneById(id: number | string, withRelated?: string[]): Promise<any>
    getValidationRules: (
      creationRules?: boolean
    ) => {
      [key: string]: string
    }
    getResourceFieldsFromPayload: (payload: DataPayload) => DataPayload
    breakFieldsIntoRelationshipsAndNonRelationships: (
      payload: DataPayload
    ) => {
      relationshipFieldsPayload: DataPayload
      nonRelationshipFieldsPayload: DataPayload
    }
    validate: (
      payload: DataPayload,
      creationRules?: boolean,
      modelId?: string | number | undefined,
      resource?: ResourceContract
    ) => Promise<DataPayload>
    validateUniqueFields: (
      payload: DataPayload,
      creationRules?: boolean,
      modelId?: string | number | undefined,
      resource?: ResourceContract
    ) => Promise<void>
    validateRelationshipFields: (payload: DataPayload) => Promise<void>
    runAction: (
      actionSlug: string,
      payload?: DataPayload
    ) => Promise<ActionResponse>
    findAllCount: () => Promise<number>
    getFieldFromResource: (
      resource: ResourceContract,
      databaseField: string
    ) => import('@tensei/common').FieldContract | undefined
    setResource: (resourceOrSlug: ResourceContract | string) => this
    findResource: (resourceSlug: string | ResourceContract) => ResourceContract
    findOneByField: (databaseField: string, value: any) => Promise<any>
  }
}

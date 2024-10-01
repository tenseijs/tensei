import { id } from '../fields/ID'
import { Action } from '../actions/Action'
import { timestamp } from '../fields/Timestamp'
import { hasOne } from '../fields/OneToOne'

import {
  Permission,
  ResourceData,
  HookFunction,
  FieldContract,
  FilterContract,
  ResourceContract,
  AuthorizeFunction,
  ValidationMessages,
  SerializedResource,
  HookFunctionPromised,
  FlushHookFunction,
  SupportedIcons,
  ResourceExtendContract
} from '@tensei/common'

import Pluralize from 'pluralize'
// import { FilterContract } from '@tensei/filters'
import { snakeCase, paramCase, camelCase, pascalCase } from 'change-case'
import { ApiType, MiddlewareFn, ResourceMethod } from '@tensei/common/resources'

interface ResourceDataWithFields<T extends ApiType = 'rest'>
  extends ResourceData<T> {
  fields: FieldContract[]
  actions: Action[]
}

export class Resource<T extends ApiType = 'rest'>
  implements ResourceContract<T> {
  public authorizeCallbacks: {
    authorizedToShow: AuthorizeFunction[]
    authorizedToFetch: AuthorizeFunction[]
    authorizedToCreate: AuthorizeFunction[]
    authorizedToUpdate: AuthorizeFunction[]
    authorizedToDelete: AuthorizeFunction[]
    authorizedToRunAction: AuthorizeFunction[]
    authorizedToFetchRelation: AuthorizeFunction[]
  } = {
      authorizedToShow: [],
      authorizedToFetch: [],
      authorizedToCreate: [],
      authorizedToUpdate: [],
      authorizedToDelete: [],
      authorizedToRunAction: [],
      authorizedToFetchRelation: []
    }

  public dashboardAuthorizeCallbacks: {
    authorizedToShow: AuthorizeFunction[]
    authorizedToFetch: AuthorizeFunction[]
    authorizedToCreate: AuthorizeFunction[]
    authorizedToUpdate: AuthorizeFunction[]
    authorizedToDelete: AuthorizeFunction[]
    authorizedToRunAction: AuthorizeFunction[]
  } = {
      authorizedToShow: [],
      authorizedToFetch: [],
      authorizedToCreate: [],
      authorizedToUpdate: [],
      authorizedToDelete: [],
      authorizedToRunAction: []
    }

  public hooks: {
    onInit: HookFunction[]
    beforeCreate: HookFunctionPromised[]
    afterCreate: HookFunctionPromised[]
    beforeUpdate: HookFunctionPromised[]
    afterUpdate: HookFunctionPromised[]
    beforeDelete: HookFunctionPromised[]
    afterDelete: HookFunctionPromised[]
    beforeFlush: FlushHookFunction[]
    onFlush: FlushHookFunction[]
    afterFlush: FlushHookFunction[]
  } = {
      onInit: [],
      beforeCreate: [],
      afterCreate: [],
      beforeUpdate: [],
      afterUpdate: [],
      beforeDelete: [],
      afterDelete: [],
      beforeFlush: [],
      onFlush: [],
      afterFlush: []
    }

  constructor(name: string, tableName?: string) {
    this.data.name = name
    this.data.namePlural = Pluralize(name)
    this.data.icon = 'category'
    this.data.label = Pluralize(name)
    this.data.snakeCaseName = snakeCase(name)
    this.data.camelCaseName = camelCase(name)
    this.data.pascalCaseName = pascalCase(name)
    this.data.pascalCaseNamePlural = Pluralize(pascalCase(name))
    this.data.slug = Pluralize(paramCase(name))
    this.data.slugSingular = paramCase(name)
    this.data.slugPlural = Pluralize(paramCase(name))
    this.data.table = tableName || Pluralize(snakeCase(name))
    this.data.camelCaseNamePlural = Pluralize(camelCase(name))
    this.data.snakeCaseNamePlural = Pluralize(snakeCase(name))

    this.data.permissions = ['Create', 'Index', 'Update', 'Delete'].map(
      name => ({
        name: `${name} ${this.data.namePlural}`,
        slug: `${name.toLowerCase()}:${this.data.slugPlural}`
      })
    )

    this.beforeCreate(async ({ entity, em }, { request }) => {
      if (request.authUser && request.authUser.id) {
        em.assign(entity, {
          createdBy: request.authUser.id
        })
      }
    })
  }

  public Model = (): any => {
    return null
  }

  public description(description: string) {
    this.data.description = description

    return this
  }

  public enableAutoFills() {
    this.data.enableAutoFills = true

    return this
  }

  public enableAutoFilters() {
    this.data.enableAutoFilters = true

    return this
  }

  public filters(filters: FilterContract[]) {
    this.data.filters = [...this.data.filters, ...filters]

    return this
  }

  public data: ResourceDataWithFields<T> = {
    fields: [
      id('ID'),
      hasOne('Admin User', 'Created By')
        .nullable()
        .sortable()
        .hideOnCreateApi()
        .hideOnUpdateApi()
        .hideOnUpdate()
        .hideOnIndex()
        .hideOnCreate(),
      timestamp('Created At')
        .defaultToNow()
        .nullable()
        .sortable()
        .onCreate(() => new Date())
        .hideOnCreateApi()
        .hideOnUpdateApi()
        .hideOnUpdate()
        .hideOnIndex()
        .hideOnCreate(),
      timestamp('Updated At')
        .defaultToNow()
        .nullable()
        .sortable()
        .onCreate(() => new Date())
        .onUpdate(() => new Date())
        .hideOnCreateApi()
        .hideOnUpdateApi()
        .hideOnCreate()
        .hideOnIndex()
        .hideOnUpdate()
    ],
    enableAutoFills: false,
    enableAutoFilters: false,
    methods: [],
    repositoryMethods: [],
    actions: [],
    table: '',
    name: '',
    slug: '',
    label: '',
    namePlural: '',
    filters: [],
    extend: {},
    icon: 'category',
    description: '',
    createMiddleware: [],
    updateMiddleware: [],
    deleteMiddleware: [],
    fetchMiddleware: [],
    hideOnCreateApi: false,
    hideOnFetchApi: false,
    hideOnDeleteApi: false,
    hideOnUpdateApi: false,
    hideOnInsertSubscription: true,
    hideOnUpdateSubscription: true,
    hideOnDeleteSubscription: true,
    permissions: [],
    group: 'Resources',
    groupSlug: 'resources',
    displayField: 'ID',
    displayFieldSnakeCase: 'id',
    secondaryDisplayField: 'ID',
    secondaryDisplayFieldSnakeCase: 'id',
    valueField: 'id',
    noTimestamps: false,
    camelCaseName: '',
    snakeCaseName: '',
    snakeCaseNamePlural: '',
    camelCaseNamePlural: '',
    pascalCaseName: '',
    pascalCaseNamePlural: '',
    slugPlural: '',
    slugSingular: '',
    validationMessages: {
      required: 'The {{ field }} is required.',
      email: 'The {{ field }} must be a valid email address.',
      unique: 'This {{ field }} has already been taken.'
    },
    displayInNavigation: true,
    perPageOptions: [10, 25, 50]
  }

  public permissions(permissions: string[] | Permission[]) {
    this.data.permissions = permissions.map(permission =>
      typeof permission === 'string'
        ? {
          name: `${permission} ${this.data.namePlural}`,
          slug: `${permission.toLowerCase()}:${this.data.slugPlural}`
        }
        : permission
    )

    return this
  }

  public noPermissions() {
    this.data.permissions = []

    return this
  }

  public hideOnApi() {
    this.data.hideOnCreateApi = true
    this.data.hideOnFetchApi = true
    this.data.hideOnDeleteApi = true
    this.data.hideOnUpdateApi = true
    this.data.hideOnApi = true

    return this
  }

  public showOnInsertSubscription() {
    this.data.hideOnInsertSubscription = false

    return this
  }

  public showOnUpdateSubscription() {
    this.data.hideOnUpdateSubscription = false

    return this
  }

  public showOnDeleteSubscription() {
    this.data.hideOnDeleteSubscription = false

    return this
  }

  public hideOnCreateApi() {
    this.data.hideOnCreateApi = true

    return this
  }

  public hideOnUpdateApi() {
    this.data.hideOnUpdateApi = true

    return this
  }

  public hideOnDeleteApi() {
    this.data.hideOnDeleteApi = true

    return this
  }

  public hideOnFetchApi() {
    this.data.hideOnFetchApi = true

    return this
  }

  public canShow(authorizeFunction: AuthorizeFunction) {
    this.authorizeCallbacks.authorizedToShow.push(authorizeFunction)

    return this
  }

  public repositoryMethod<Fn = ResourceMethod>(name: string, fn: Fn) {
    this.data.repositoryMethods = [
      ...this.data.repositoryMethods,
      {
        name,
        fn
      }
    ]

    return this
  }

  public method<Fn = ResourceMethod>(name: string, fn: Fn) {
    this.data.methods = [
      ...this.data.methods,
      {
        name,
        fn
      }
    ]

    return this
  }

  public canFetch(authorizeFunction: AuthorizeFunction) {
    this.authorizeCallbacks.authorizedToFetch.push(authorizeFunction)

    return this
  }

  public canFetchRelation(authorizeFunction: AuthorizeFunction) {
    this.authorizeCallbacks.authorizedToFetchRelation.push(authorizeFunction)

    return this
  }

  public canCreate(authorizeFunction: AuthorizeFunction) {
    this.authorizeCallbacks.authorizedToCreate.push(authorizeFunction)

    return this
  }

  public canUpdate(authorizeFunction: AuthorizeFunction) {
    this.authorizeCallbacks.authorizedToUpdate.push(authorizeFunction)

    return this
  }

  public canDelete(authorizeFunction: AuthorizeFunction) {
    this.authorizeCallbacks.authorizedToDelete.push(authorizeFunction)

    return this
  }

  public canRunAction(authorizeFunction: AuthorizeFunction) {
    this.authorizeCallbacks.authorizedToRunAction.push(authorizeFunction)

    return this
  }

  public canShowOnDashboard(authorizeFunction: AuthorizeFunction) {
    this.dashboardAuthorizeCallbacks.authorizedToShow.push(authorizeFunction)

    return this
  }

  public canFetchOnDashboard(authorizeFunction: AuthorizeFunction) {
    this.dashboardAuthorizeCallbacks.authorizedToFetch.push(authorizeFunction)

    return this
  }

  public canCreateOnDashboard(authorizeFunction: AuthorizeFunction) {
    this.dashboardAuthorizeCallbacks.authorizedToCreate.push(authorizeFunction)

    return this
  }

  public canUpdateOnDashboard(authorizeFunction: AuthorizeFunction) {
    this.dashboardAuthorizeCallbacks.authorizedToUpdate.push(authorizeFunction)

    return this
  }

  public canDeleteOnDashboard(authorizeFunction: AuthorizeFunction) {
    this.dashboardAuthorizeCallbacks.authorizedToDelete.push(authorizeFunction)

    return this
  }

  public canRunActionOnDashboard(authorizeFunction: AuthorizeFunction) {
    this.dashboardAuthorizeCallbacks.authorizedToRunAction.push(
      authorizeFunction
    )

    return this
  }

  public createMiddleware(middleware: MiddlewareFn<T>[]) {
    this.data.createMiddleware = [...this.data.createMiddleware, ...middleware]

    return this
  }
  public fetchMiddleware(middleware: MiddlewareFn<T>[]) {
    this.data.fetchMiddleware = [...this.data.fetchMiddleware, ...middleware]
    return this
  }
  public updateMiddleware(middleware: MiddlewareFn<T>[]) {
    this.data.updateMiddleware = [...this.data.updateMiddleware, ...middleware]
    return this
  }
  public deleteMiddleware(middleware: MiddlewareFn<T>[]) {
    this.data.deleteMiddleware = [...this.data.deleteMiddleware, ...middleware]
    return this
  }

  public displayField(displayField: string) {
    const field = this.data.fields.find(field => field.name === displayField)

    if (!field) {
      console.error(
        `A field with name ${displayField} was not found on resource ${this.data.name}.`
      )

      return this
    }

    this.data.displayField = displayField
    this.data.displayFieldSnakeCase = field.databaseField

    return this
  }

  public secondaryDisplayField(displayField: string) {
    const field = this.data.fields.find(field => field.name === displayField)

    if (!field) {
      console.error(
        `A field with name ${displayField} was not found on resource ${this.data.name}.`
      )

      return this
    }

    this.data.secondaryDisplayField = displayField
    this.data.secondaryDisplayFieldSnakeCase = field.databaseField

    return this
  }

  public fields(fields: FieldContract[]) {
    // Make sure there's only one primary key on the resource (For now).
    const customPrimaryField = fields.find(field => field.property.primary)

    if (customPrimaryField) {
      this.data.fields = this.data.fields.filter(field => field.name === 'ID')
    }

    this.data.fields = [...this.data.fields, ...fields]

    // Find a way to reorder and place `Created At` and `Updated At` at the bottom
    const timestamps = this.data.fields.filter(field =>
      ['Created At', 'Updated At'].includes(field.name)
    )

    const others = this.data.fields.filter(
      field => !['Created At', 'Updated At'].includes(field.name)
    )

    this.data.fields = [...others, ...timestamps]

    return this
  }

  public actions(actions: Action[]) {
    this.data.actions = actions

    return this
  }

  public noTimestamps() {
    this.data.noTimestamps = true
    this.data.fields = this.data.fields.filter(
      field => !['Created At', 'Updated At'].includes(field.name)
    )

    return this
  }

  public perPageOptions(perPageOptions: number[]) {
    this.data.perPageOptions = perPageOptions

    return this
  }

  public displayInNavigation() {
    this.data.displayInNavigation = true

    return this
  }

  public hideFromNavigation() {
    this.data.displayInNavigation = false

    return this
  }

  public validationMessages(validationMessages: ValidationMessages) {
    this.data.validationMessages = validationMessages

    return this
  }

  public group(groupName: string) {
    this.data.group = groupName
    this.data.groupSlug = paramCase(groupName)

    return this
  }

  public slug(slug: string) {
    this.data.slug = slug

    return this
  }

  public label(label: string) {
    this.data.label = label

    return this
  }

  public icon(icon: SupportedIcons) {
    this.data.icon = icon

    return this
  }

  public serialize(): SerializedResource<T> {
    const { table, ...rest } = this.data

    return {
      ...rest,
      fields: this.data.fields.map(field => field.serialize()),
      actions: this.data.actions.map(action => action.serialize())
    }
  }

  public beforeCreate(hook: HookFunctionPromised) {
    this.hooks = {
      ...this.hooks,
      beforeCreate: [...this.hooks.beforeCreate, hook]
    }

    return this
  }

  public beforeUpdate(hook: HookFunctionPromised) {
    this.hooks = {
      ...this.hooks,
      beforeUpdate: [...this.hooks.beforeUpdate, hook]
    }

    return this
  }

  public afterUpdate(hook: HookFunctionPromised) {
    this.hooks = {
      ...this.hooks,
      afterUpdate: [...this.hooks.afterUpdate, hook]
    }

    return this
  }

  public beforeDelete(hook: HookFunctionPromised) {
    this.hooks = {
      ...this.hooks,
      beforeDelete: [...this.hooks.beforeDelete, hook]
    }

    return this
  }

  public afterDelete(hook: HookFunctionPromised) {
    this.hooks = {
      ...this.hooks,
      afterDelete: [...this.hooks.afterDelete, hook]
    }

    return this
  }

  public afterCreate(hook: HookFunctionPromised) {
    this.hooks = {
      ...this.hooks,
      afterCreate: [...this.hooks.afterCreate, hook]
    }

    return this
  }

  public onInit(hook: HookFunction) {
    this.hooks = {
      ...this.hooks,
      onInit: [...this.hooks.onInit, hook]
    }

    return this
  }

  public extend(extend: ResourceExtendContract) {
    this.data.extend = extend

    return this
  }

  public getCreateApiExposedFields() {
    return this.data.fields.filter(f => !f.showHideFieldFromApi.hideOnCreateApi)
  }

  public getPrimaryField() {
    return this.data.fields.find(f => f.property.primary)
  }

  public getUpdateApiExposedFields() {
    return this.data.fields.filter(f => !f.showHideFieldFromApi.hideOnUpdateApi)
  }

  public getFetchApiExposedFields() {
    return this.data.fields.filter(f => !f.showHideFieldFromApi.hideOnFetchApi)
  }

  public isHiddenOnApi() {
    return (
      this.data.hideOnCreateApi &&
      this.data.hideOnDeleteApi &&
      this.data.hideOnFetchApi &&
      this.data.hideOnUpdateApi
    )
  }
}

export const resource = <T extends ApiType = 'rest'>(
  name: string,
  tableName?: string
) => new Resource<T>(name, tableName)

export default Resource

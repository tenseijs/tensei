import {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios'
import * as Lib from '@tensei/eui'
import * as styled from 'styled-components'

export interface UserPermission {
  id: number
  name: string
  slug: string
}

export type Permission = Omit<UserPermission, 'id'>

export interface UserRole {
  id: number
  name: string
  slug: string
  adminPermissions: UserPermission[]
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: UserRole[]
  active: boolean
  createdAt: string
  updatedAt: string
  adminRoles: UserRole[]
  adminPermissions: string[]
}

export interface CmsRoute {
  settings: boolean
  path: string
  group?: string
  name: string
  exact?: boolean
  top?: boolean
  icon?: React.ReactChild
  component: React.FC<any>
  requiredPermissions: string[]
}

export interface TenseiCtxInterface {
  user: User
  booted?: boolean
  setUser: (user: User) => void
  setBooted: (booted: boolean) => void
  routes: CmsRoute[]
  setRoutes: (routes: CmsRoute[]) => void
}

export interface TenseiState {
  admin: User
  config: {
    name: string
    apiPath: string
    serverUrl: string
    dashboardPath: string
    pluginsConfig: {
      [key: string]: any
    }
  }
  permissions: {
    [key: string]: boolean
  }
  registered: boolean
  resources: ResourceContract[]
  resourcesMap: {
    [key: string]: ResourceContract
  }
}

export interface SerializedTenseiState {
  ctx: string
  admin?: string
  resources: string
  registered: string
  shouldShowRegistrationScreen: string
}

export interface AbstractData {
  [key: string]: any
}

export interface PaginatedData {
  meta: {
    page: number
    perPage: number
    pageCount?: number
    total?: number
  }
  search?: string
  data: AbstractData[]
  sort?: {
    field?: string
    direction?: 'asc' | 'desc'
  }
}

export interface DetailComponentProps {
  detailId?: string
  field: FieldContract
  value: AbstractData['']
  values: AbstractData
  resource: ResourceContract
}

export interface FormComponentProps {
  id: string
  name: string
  editing?: boolean
  editingId?: string
  form: AbstractData
  field: FieldContract
  value: AbstractData['']
  values: AbstractData
  errors: AbstractData
  activeField?: FieldContract
  onFocus?: () => void
  onBlur?: () => void
  error: string | undefined
  resource: ResourceContract
  onChange: (value: any) => void
  onKeyDown?: (event: any) => void
}

export interface IndexComponentProps {
  field: FieldContract
  value: AbstractData['']
  values: AbstractData
  resource: ResourceContract
}

export interface FieldContract {
  name: string
  component: {
    form: string
    index: string
    detail: string
  }
  sidebar: boolean
  inputName: string
  isSortable: boolean
  description: string
  rules: string[]
  isVirtual: boolean
  defaultValue: string | boolean | number
  isNullable: boolean
  isUnique: boolean
  isSearchable: boolean
  showOnIndex: boolean
  showOnDetail: boolean
  showOnUpdate: boolean
  showOnCreation: boolean
  updateRules: string[]
  creationRules: string[]
  hidden: boolean
  fieldName: string
  camelCaseName: string
  capsDatabasefieldName: string
  databaseField: string
  attributes: {
    [key: string]: string
  }
  selectOptions?: {
    label: string
    value: string
  }[]
  defaultToNow?: boolean
  isUnsigned?: boolean
  trueLabel?: string
  falseLabel?: string
  truncate: number
  isRelationshipField: boolean
  camelCaseNamePlural: string
  pascalCaseName: string
  snakeCaseName: string
  snakeCaseNamePlural: string
  [key: string]: any
  positiveValues?: any[]
}

export interface ResourceContract {
  camelCaseName: string
  namePlural: string
  camelCaseNamePlural: string
  description: string
  displayField: string
  displayFieldSnakeCase: string
  secondaryDisplayField: string
  secondaryDisplayFieldSnakeCase: string
  displayInNavigation: true
  fields: FieldContract[]
  group: string
  icon: string
  groupSlug: string
  hideOnApi: boolean
  hideOnDeleteApi: boolean
  hideOnDeleteSubscription: boolean
  hideOnFetchApi: boolean
  hideOnCreateApi: boolean
  hideOnInsertSubscription: boolean
  hideOnUpdateApi: boolean
  hideOnUpdateSubscription: boolean
  label: string
  name: string
  noTimestamps: boolean
  pascalCaseName: string
  perPageOptions: number[]
  permissions: Permission[]
  slug: string
  slugPlural: string
  slugSingular: string
  snakeCaseName: string
  snakeCaseNamePlural: string
  table: string
}

export interface TenseiRegisterParams {
  route: (route: Partial<CmsRoute>) => void
  formComponent: (name: string, Component: React.FC<any>) => void
  indexComponent: (name: string, Component: React.FC<any>) => void
}

export type TenseiRegisterFunction = (params: TenseiRegisterParams) => void

export interface Tensei {
  boot: () => void
  styled: typeof styled & {
    styled: typeof styled.default
  }
  state: TenseiState
  ctx: TenseiCtxInterface
  getPath: (path: string) => string
  client: AxiosInstance
  api: {
    get<T = any, R = AxiosResponse<T>>(
      url: string,
      config?: AxiosRequestConfig
    ): Promise<[R | null, AxiosError | null]>
    delete<T = any, R = AxiosResponse<T>>(
      url: string,
      config?: AxiosRequestConfig
    ): Promise<[R | null, AxiosError | null]>
    post<T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<[R | null, AxiosError | null]>
    put<T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<[R | null, AxiosError | null]>
    patch<T = any, R = AxiosResponse<T>>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<[R | null, AxiosError | null]>
  }
  components: {
    form: {
      [key: string]: React.FunctionComponent<any>
    }
    index: {
      [key: string]: React.FunctionComponent<any>
    }
  }
  eui: typeof Lib
  route: (route: Partial<CmsRoute>) => void

  formComponent: (name: string, Component: React.FC<any>) => void
  indexComponent: (name: string, Component: React.FC<any>) => void
  register: (fn: TenseiRegisterFunction) => void
}

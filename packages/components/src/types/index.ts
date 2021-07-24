import { AxiosInstance } from 'axios'

export interface UserPermission {
  id: number
  name: string
  slug: string
}

export interface UserRole {
  id: number
  name: string
  slug: string
  admin_permissions: UserPermission[]
}

export interface User {
  id: string
  email: string
  roles: UserRole[]
  created_at: string
  updated_at: string
  admin_roles: UserRole[]
  admin_permissions: string[]
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
    per_page: number
    page_count?: number
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
  permissions: string[]
  slug: string
  slugPlural: string
  slugSingular: string
  snakeCaseName: string
  snakeCaseNamePlural: string
  table: string
}

interface TenseiRegisterParams {
  route: (route: Partial<CmsRoute>) => void
  formComponent: (name: string, Component: React.FC<any>) => void
  indexComponent: (name: string, Component: React.FC<any>) => void
  detailComponent: (name: string, Component: React.FC<any>) => void
}

export type TenseiRegisterFunction = (params: TenseiRegisterParams) => void

export interface ToastOptions {
  duration?: number | null
  type?: 'error' | 'success' | 'info' | 'warning'
  action?: {
    onClick: () => void
    text?: string
  }
  theme?: string | null
  position?:
    | 'top-center'
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'bottom-left'
}

export interface ToastInterface {
  show: (message: string, options?: ToastOptions) => void
  success: (message: string, options?: ToastOptions) => void
  info: (message: string, options?: ToastOptions) => void
  warning: (message: string, options?: ToastOptions) => void
  error: (message: string, options?: ToastOptions) => void
}

export interface Tensei {
  boot: () => void
  state: TenseiState
  ctx: TenseiCtxInterface
  getPath: (path: string) => string
  client: AxiosInstance
  components: {
    form: {
      [key: string]: React.FunctionComponent<any>
    }
    index: {
      [key: string]: React.FunctionComponent<any>
    }
    detail: {
      [key: string]: React.FunctionComponent<any>
    }
  }
  toast: ToastInterface
  clear: () => void
  lib: {
    [key: string]: React.FunctionComponent<any>
  }
  route: (route: Partial<CmsRoute>) => void
  show: (message: string, options?: ToastOptions) => void
  success: (message: string, options?: ToastOptions) => void
  info: (message: string, options?: ToastOptions) => void
  warning: (message: string, options?: ToastOptions) => void
  error: (message: string, options?: ToastOptions) => void
  formComponent: (name: string, Component: React.FC<any>) => void
  indexComponent: (name: string, Component: React.FC<any>) => void
  detailComponent: (name: string, Component: React.FC<any>) => void
  register: (fn: TenseiRegisterFunction) => void
}

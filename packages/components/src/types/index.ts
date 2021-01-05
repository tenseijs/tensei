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
    permissions: UserPermission[]
}

export interface User {
    id: string
    email: string
    roles: UserRole[]
    created_at: string
    updated_at: string
    permissions: UserPermission[]
}

export interface TenseiCtxInterface {
    user: User
    booted?: boolean
    setUser: (user: User) => void
    setBooted: (booted: boolean) => void
}

export interface TenseiState {
    admin: User
    config: {
        apiPath: string
        dashboardPath: string
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
    [key: string]: string | number | boolean | undefined
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
    field: FieldContract
    value: AbstractData['']
    values: AbstractData
    resource: ResourceContract
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
    isRelationshipField: boolean
    camelCaseNamePlural: string
    pascalCaseName: string
    snakeCaseName: string
    snakeCaseNamePlural: string
    [key: string]: any
}

export interface ResourceContract {
    camelCaseName: string
    camelCaseNamePlural: string
    description: string
    displayField: string
    displayFieldSnakeCase: string
    displayInNavigation: true
    fields: FieldContract[]
    group: string
    groupSlug: string
    hideOnDeleteApi: false
    hideOnDeleteSubscription: true
    hideOnFetchApi: false
    hideOnInsertApi: false
    hideOnInsertSubscription: true
    hideOnUpdateApi: false
    hideOnUpdateSubscription: true
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
    formComponent: (name: string, Component: React.FC<any>) => void
    indexComponent: (name: string, Component: React.FC<any>) => void
    detailComponent: (name: string, Component: React.FC<any>) => void
}

export type TenseiRegisterFunction = (params: TenseiRegisterParams) => void

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
    formComponent: (name: string, Component: React.FC<any>) => void
    indexComponent: (name: string, Component: React.FC<any>) => void
    detailComponent: (name: string, Component: React.FC<any>) => void
    register: (fn: TenseiRegisterFunction) => void
}

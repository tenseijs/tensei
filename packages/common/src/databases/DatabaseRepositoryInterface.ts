import { Resource } from '../resources/Resource'
import {
    FlamingoConfig,
    User,
    FetchAllResults,
    FetchAllRequestQuery,
} from '../config'

export abstract class DatabaseRepositoryInterface<Model = {}> {
    static databases: string[]
    abstract setup: (config: FlamingoConfig) => Promise<any>
    abstract establishDatabaseConnection: () => void
    abstract findUserByEmail: (email: string) => Promise<User | null>
    abstract getAdministratorsCount: () => Promise<number>
    abstract create: (resource: Resource, payload: {}) => Promise<Model>
    abstract findAll: (
        resource: Resource,
        query: FetchAllRequestQuery
    ) => Promise<FetchAllResults>
    abstract findAllByIds: (
        resource: Resource,
        ids: number[],
        fields?: string[]
    ) => Promise<Model[]>
    abstract findOneById: (
        resource: Resource,
        id: number | string,
        fields?: string[]
    ) => Promise<Model | null>
    abstract findOneByField: (
        resource: Resource,
        field: string,
        value: string,
        fields?: string[]
    ) => Promise<Model | null>
    abstract findOneByFieldExcludingOne: (
        resource: Resource,
        field: string,
        value: string,
        excludeId: string | number,
        fields?: string[]
    ) => Promise<Model | null>
    abstract updateManyByIds: (
        resource: Resource,
        ids: number[],
        valuesToUpdate: {}
    ) => Promise<number>
    // abstract updateOneById: (
    //     resource: Resource,
    //     id: number|string,
    //     valuesToUpdate: {}
    // ) => Promise<number>
    abstract deleteById: (
        resource: Resource,
        id: number | string
    ) => Promise<any>
    abstract updateManyWhere: (
        resource: Resource,
        whereClause: {
            [key: string]: string | number
        },
        valuesToUpdate: {}
    ) => Promise<any>
}

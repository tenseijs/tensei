import { Resource } from '../resources/Resource'
import {
    FlamingoConfig,
    User,
    FetchAllResults,
    FetchAllRequestQuery,
    DataPayload,
} from '../config'

export abstract class DatabaseRepositoryInterface<Model = any> {
    static databases: string[]
    abstract setup: (config: FlamingoConfig) => Promise<any>
    abstract setResourceModels: (resources: Resource[]) => Resource[]
    abstract establishDatabaseConnection: () => void
    abstract findUserByEmail: (email: string) => Promise<Model | null>
    abstract getAdministratorsCount: () => Promise<number>
    abstract create: (
        resource: Resource,
        payload: DataPayload,
        relationshipPayload: DataPayload
    ) => Promise<Model>
    abstract update: (
        resource: Resource,
        id: number | string,
        payload: DataPayload,
        relationshipPayload: DataPayload,
        patch: boolean
    ) => Promise<Model>
    abstract findAll: (
        resource: Resource,
        query: FetchAllRequestQuery
    ) => Promise<FetchAllResults>
    abstract findAllByIds: (
        resource: Resource,
        ids: number[],
        fields?: string[]
    ) => Promise<Model[]>
    abstract findAllBelongingToMany: (
        resource: Resource,
        relatedResource: Resource,
        resourceId: number | string,
        query: FetchAllRequestQuery
    ) => Promise<FetchAllResults>
    abstract findOneById: (
        resource: Resource,
        id: number | string,
        fields?: string[],
        withRelationships?: string[]
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

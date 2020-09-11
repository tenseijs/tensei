import Knex from 'knex'
import {
    DatabaseRepositoryInterface,
    SerializedResource,
    Config,
    ResourceContract,
    DataPayload,
    FetchAllRequestQuery,
} from '@tensei/common'

declare module '@tensei/core' {
    export interface TenseiContract {
        databaseConfig: (config: Knex.Config) => this
    }
}

declare module '@tensei/common' {
    export interface ResourceContract {
        Model: () => any
    }

    export interface Config {
        databaseConfig: Knex
    }
}

declare module '@tensei/knex' {
    export class Repository implements DatabaseRepositoryInterface {
        static databases: string[]
        abstract setup: (config: Config) => Promise<any>
        abstract setResourceModels: (
            resources: ResourceContract[]
        ) => ResourceContract[]
        abstract establishDatabaseConnection: () => void
        abstract create: (
            payload: DataPayload,
            relationshipPayload: DataPayload
        ) => Promise<Model>
        abstract update: (
            id: number | string,
            payload: DataPayload,
            relationshipPayload: DataPayload,
            patch: boolean
        ) => Promise<Model>
        abstract findAll: (
            query: FetchAllRequestQuery
        ) => Promise<FetchAllResults>
        abstract findAllByIds: (
            ids: number[],
            fields?: string[]
        ) => Promise<Model[]>
        abstract findAllBelongingToMany: (
            relatedResourceContract: ResourceContract,
            ResourceContractId: number | string,
            query: FetchAllRequestQuery
        ) => Promise<FetchAllResults>
        abstract findOneById: (
            id: number | string,
            fields?: string[],
            withRelationships?: string[]
        ) => Promise<Model | null>
        abstract findOneByField: (
            field: string,
            value: string,
            fields?: string[]
        ) => Promise<Model | null>
        abstract findOneByFieldExcludingOne: (
            field: string,
            value: string,
            excludeId: string | number,
            fields?: string[]
        ) => Promise<Model | null>
        abstract updateManyByIds: (
            ids: number[],
            valuesToUpdate: {}
        ) => Promise<number>
        abstract updateOneByField: (
            field: string,
            value: any,
            payload: DataPayload = {}
        ) => Promise<any>
        abstract deleteById: (
            id: number | string
        ) => Promise<any>
        abstract updateManyWhere: (
            whereClause: {
                [key: string]: string | number
            },
            valuesToUpdate: {}
        ) => Promise<any>
        abstract findAllCount: (resource: ResourceContract) => Promise<number>
    }
}

import Mongoose from 'mongoose'

import {
    Config,
    DataPayload,
    ResourceHelpers,
    FetchAllResults,
    FetchAllRequestQuery,
    DatabaseRepositoryInterface
} from '@tensei/common'
import { PluginSetupConfig } from '@tensei/common'

declare module '@tensei/core' {
    export interface TenseiContract {
        databaseConfig: (
            uri: string,
            config?: Mongoose.ConnectionOptions
        ) => this
    }
}

declare module '@tensei/common' {
    export interface ResourceContract {
        Model: () => Mongoose.Model<any, any>
    }

    export interface Config {
        databaseConfig: [string, Mongoose.ConnectionOptions]
    }

    export abstract class Repository
        extends ResourceHelpers
        implements DatabaseRepositoryInterface {
        static databases: string[]
        abstract setup: (config: Config) => Promise<any>
        abstract setResourceModels: (
            resources: ResourceContract[]
        ) => ResourceContract[]
        abstract establishDatabaseConnection: () => void
        abstract create: (
            payload: DataPayload,
            relationshipPayload: DataPayload
        ) => Promise<Mongoose.Model<any, any>>
        abstract update: (
            id: number | string,
            payload: DataPayload,
            relationshipPayload: DataPayload,
            patch: boolean
        ) => Promise<Mongoose.Model<any, any>>
        abstract findAll: (
            query: FetchAllRequestQuery
        ) => Promise<FetchAllResults>
        abstract findAllByIds: (
            ids: string[],
            fields?: string[]
        ) => Promise<Mongoose.Model<any, any>[]>
        abstract findAllBelongingToMany: (
            relatedResourceContract: ResourceContract,
            ResourceContractId: number | string,
            query: FetchAllRequestQuery
        ) => Promise<FetchAllResults>
        abstract findOneById: (
            id: number | string,
            fields?: string[],
            withRelationships?: string[]
        ) => Promise<Mongoose.Model<any, any> | null>
        abstract findOneByField: (
            field: string,
            value: string,
            fields?: string[]
        ) => Promise<Mongoose.Model<any, any> | null>
        abstract findOneByFieldExcludingOne: (
            field: string,
            value: string,
            excludeId: string | number,
            fields?: string[]
        ) => Promise<Mongoose.Model<any, any> | null>
        abstract updateManyByIds: (
            ids: number[],
            valuesToUpdate: {}
        ) => Promise<number>
        abstract updateOneByField: (
            field: string,
            value: any,
            payload: DataPayload
        ) => Promise<any>
        abstract deleteById: (id: number | string) => Promise<any>
        abstract updateManyWhere: (
            whereClause: {
                [key: string]: string | number
            },
            valuesToUpdate: {}
        ) => Promise<any>
        abstract findAllCount: () => Promise<number>
        abstract aggregateCount: (between: [string, string]) => Promise<number>
        abstract aggregateAvg: (
            between: [string, string],
            columns: string[]
        ) => Promise<number>
        abstract aggregateMax: (
            between: [string, string],
            columns: string[]
        ) => Promise<number>
        abstract aggregateMin: (
            between: [string, string],
            columns: string[]
        ) => Promise<number>
    }
}

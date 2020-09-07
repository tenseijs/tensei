import Knex from 'knex';
import { DatabaseRepositoryInterface, SerializedResource, Config, ResourceContract, DataPayload, FetchAllRequestQuery } from '@tensei/common';

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
        establishDatabaseConnection: () => void;
        setup: (config: Config) => Promise<Knex<any, unknown[]> | null>;
        setResourceModels: (resources: ResourceContract[]) => ResourceContract<{}>[];
        handleBelongsToManyField: (trx: Knex.Transaction, resources: SerializedResource[], resource: SerializedResource, schema: any) => Promise<void>;
        performDatabaseSchemaSync: (resources?: SerializedResource[]) => Promise<void>;
        findUserByEmail: (email: string) => Promise<any>;
        getAdministratorsCount: () => Promise<number>;
        create: (resource: ResourceContract, payload: DataPayload, relationshipPayload: DataPayload) => Promise<any>;
        update: (resource: ResourceContract, id: number | string, payload?: DataPayload, relationshipPayload?: DataPayload, patch?: boolean) => Promise<any>;
        updateManyByIds: (resource: ResourceContract, ids: number[], valuesToUpdate: {}) => Promise<number>;
        updateOneByField: (resource: ResourceContract, field: string, value: any, payload?: DataPayload) => Promise<number>;
        updateManyWhere: (resource: ResourceContract, whereClause: {}, valuesToUpdate: {}) => Promise<number>;
        deleteById: (resource: ResourceContract, id: number | string) => Promise<number>;
        findAllByIds: (resource: ResourceContract, ids: number[], fields?: string[] | undefined) => Promise<any[]>;
        findOneById: (resource: ResourceContract, id: number | string, fields?: string[] | undefined, withRelated?: string[]) => Promise<any>;
        findOneByField: (resource: ResourceContract, field: string, value: string, fields?: string[] | undefined) => Promise<any>;
        findOneByFieldExcludingOne: (resource: ResourceContract, field: string, value: string, excludeId: string | number, fields?: string[] | undefined) => Promise<any>;
        findAllBelongingToMany: (resource: ResourceContract, relatedResource: ResourceContract, resourceId: string | number, query: FetchAllRequestQuery) => Promise<{
            page: number;
            perPage: number;
            total: number;
            pageCount: number;
            data: any;
        }>;
        handleFilterQueries: (filters: FetchAllRequestQuery['filters'], builder: Knex) => Knex;
        findAll: (resource: ResourceContract, query: FetchAllRequestQuery) => Promise<{
            total: any;
            data: any;
            page: number;
            perPage: number;
            pageCount: number;
        }>;
        getAdministratorById: (id: number | string) => Promise<{
            name: any;
            email: any;
            id: number;
            roles: any;
            permissions: any;
        } | null>;
    }
}

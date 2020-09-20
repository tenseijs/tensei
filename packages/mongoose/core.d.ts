import Mongoose from 'mongoose'

import {
    DatabaseRepositoryInterface,
    FetchAllResults,
    Config,
    ResourceContract,
    DataPayload,
    FetchAllRequestQuery
} from '@tensei/common'

declare module '@tensei/core' {
    export interface TenseiContract {
        databaseConfig: (
            uri: string,
            config: Mongoose.ConnectionOptions
        ) => this
    }
}

declare module '@tensei/common' {
    export interface ResourceContract {
        Model: () => any
    }

    export interface Config {
        databaseConfig: [string, Mongoose.ConnectionOptions]
    }
}

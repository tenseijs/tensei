declare module '@tensei/common/storage' {
  import { Config } from '@tensei/common/config'

  export interface File<Metadata = any> {
    name: string
    mimeType: string
    extension: string

    hash: string
    path: string
    disk: string
    hashPrefix?: string
    extension: string
    disk: string

    url: string
    diskMeta: Metadata
  }

  export interface DefaultStorageDriverConfig {
    name: string
    shortName: string
    tenseiConfig?: Config
  }

  export interface DefaultStorageResponse {
    url: string
    metadata?: any
  }

  export interface LocalStorageConfig extends DefaultStorageDriverConfig {
    root: string
  }

  export interface StorageManagerInterface {
    drivers: StorageDriverInterface<any>[]
    addDriver: <Config extends DefaultStorageDriverConfig>(
      driver: StorageDriverInterface<Config>
    ) => this
    disk: <Config extends DefaultStorageDriverConfig>(
      name: string
    ) => StorageDriverInterface<Config>
  }

  export interface StorageDriverInterface<
    DriverConfig extends DefaultStorageDriverConfig
  > {
    upload: (
      location: string,
      content: Buffer | NodeJS.ReadableStream | string
    ) => Promise<DefaultStorageResponse>
    destroy: (file: File) => void
    register?: () => void
    boot?: () => Promise<void>
    config: DriverConfig
  }

  export class LocalStorageDriver
    implements StorageDriverInterface<LocalStorageConfig> {
    upload: (
      location: string,
      content: Buffer | NodeJS.ReadableStream | string
    ) => Promise<DefaultStorageResponse>
    destroy: (file: File) => void
    config: LocalStorageConfig
    constructor(config: Partial<LocalStorageConfig>): this
  }

  export class StorageDriverManager implements StorageManagerInterface {
    drivers: StorageDriverInterface<any>[]
    addDriver: <Config extends DefaultStorageDriverConfig>(
      driver: StorageDriverInterface<Config>
    ) => this
    disk: <Config extends DefaultStorageDriverConfig>(
      name: string
    ) => StorageDriverInterface<Config>['config']
  }
}

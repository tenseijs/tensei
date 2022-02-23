declare module '@tensei/common/storage' {
  import { Config } from '@tensei/common/config'

  export interface File {
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
    diskMeta: any
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
    root: string,
    resolvedRoot: root
  }

  export interface S3StorageConfig extends DefaultStorageDriverConfig {
    bucket: string
    accessKeyId: string
    secretAccessKey: string
    region: string
  }

  export interface CloudinaryDriverInterface {
    name: string
    shortName: string
    cloudName: string
    apiKey: string
    apiSecret: string
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
    implements StorageDriverInterface<LocalStorageConfig>
  {
    upload: (
      location: string,
      content: Buffer | NodeJS.ReadableStream | string
    ) => Promise<DefaultStorageResponse>
    destroy: (file: File) => void
    config: LocalStorageConfig
    constructor(config: Partial<LocalStorageConfig>): this
  }

  export class S3StorageDriver
    implements StorageDriverInterface<S3StorageConfig> {
    upload: (
      location: string,
      content: Buffer | NodeJS.ReadableStream | string
    ) => Promise<DefaultStorageResponse>
    destroy: (file: File) => void
    config: S3StorageConfig
    constructor(config: Partial<S3StorageConfig>): this
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

  export class CloudinaryStorageDriver {
    upload: (
      location: string,
      content: Buffer | NodeJS.ReadableStream | string
    ) => Promise<any>
    destroy: (location: string) => void
    config: CloudinaryDriverInterface
    constructor(config: Partial<CloudinaryDriverInterface>): this
  }
}

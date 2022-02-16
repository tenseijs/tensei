import fse from 'fs-extra'
import { paramCase } from 'change-case'
import { join, sep, resolve, dirname } from 'path'
import {
  DefaultStorageDriverConfig,
  StorageDriverInterface,
  StorageManagerInterface,
  LocalStorageConfig,
  DefaultStorageResponse,
  S3StorageConfig
} from '@tensei/common'
import { isReadableStream, pipeline } from './StorageDriverUtils'
import { response } from 'express'

export class LocalStorageDriver
  implements StorageDriverInterface<LocalStorageConfig> {
  config: LocalStorageConfig = {
    name: '',
    shortName: '',
    root: ''
  }

  private _fullPath(relativePath: string): string {
    return join(this.config.root, join(sep, relativePath))
  }

  constructor(config?: Partial<LocalStorageConfig>) {
    this.config.name = config?.name || 'Local'
    this.config.shortName = config?.shortName || paramCase(this.config.name)

    this.config.root = resolve(
      config?.root || join(process.cwd(), 'public/storage')
    )
  }

  async upload(
    location: string,
    content: Buffer | NodeJS.ReadableStream | string
  ): Promise<DefaultStorageResponse> {
    const fullPath = this._fullPath(location)

    const fileUrl = `${this.config?.tenseiConfig?.serverUrl}/${join(
      'public',
      'storage',
      location
    )}`

    if (isReadableStream(content)) {
      const dir = dirname(fullPath)

      await fse.ensureDir(dir)

      const ws = fse.createWriteStream(fullPath)

      await pipeline(content, ws)

      return { url: fileUrl }
    }

    await fse.outputFile(fullPath, content)

    return { url: fileUrl }
  }

  async destroy(location: string, metadata?: any) { }
}

export class S3StorageDriver
  implements StorageDriverInterface<S3StorageConfig> {

  aws = require('aws-sdk');
  S3 = require('aws-sdk/clients/s3');

  config: S3StorageConfig = {
    name: '',
    shortName: '',
    bucket: '',
    accessKeyId: '',
    secretAccessKey: '',
    region: ''
  }

  constructor(config?: Partial<S3StorageConfig>) {
    this.config.name = config?.name || 'S3'
    this.config.shortName = config?.shortName || paramCase(this.config.name)
    this.config.bucket = config?.bucket!
    this.config.region = config?.region!
    this.config.accessKeyId = config?.accessKeyId!
    this.config.secretAccessKey = config?.secretAccessKey!
  }

  async upload(
    location: string,
    content: Buffer | NodeJS.ReadableStream | string
  ): Promise<DefaultStorageResponse> {

    const client = new this.S3({
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      region: this.config.region
    });

    location = location.slice(1)

    if (isReadableStream(content)) {
      try {
        const params = {
          Bucket: this.config.bucket,
          Key: location,
          Body: content
        }

        const response = await client.upload(params).promise();

        return { url: response.Location }
      } catch (e) {
        console.log(e)
      }
    }

    return { url: join(`https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${location}`) }
  }

  async destroy(location: string, metadata?: any) {

    const client = new this.S3({
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      region: this.config.region
    });

    location = location.slice(1)

    try {

      const params = {
        Bucket: this.config.bucket,
        Key: location
      }

      await client.deleteObject(params).promise();

    } catch (e) {
      console.log(e);
    }
  }

}

export class StorageDriverManager implements StorageManagerInterface {
  drivers: StorageDriverInterface<any>[] = []

  disk<Config extends DefaultStorageDriverConfig>(name: string) {
    const driver = this.drivers.find(
      d => d.config.name === name || d.config.shortName === name
    )

    if (!driver) {
      throw new Error(`Driver ${name} not found.`)
    }

    return driver as StorageDriverInterface<Config>
  }

  addDriver<Config extends DefaultStorageDriverConfig>(
    driver: StorageDriverInterface<Config>
  ) {
    this.drivers.push(driver)

    return this
  }
}

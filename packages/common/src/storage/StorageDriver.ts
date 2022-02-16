import fse from 'fs-extra'
import { paramCase } from 'change-case'
import { join, sep, resolve, dirname } from 'path'
import {
  DefaultStorageDriverConfig,
  StorageDriverInterface,
  StorageManagerInterface,
  CloudinaryDriverInterface,
  LocalStorageConfig,
  DefaultStorageResponse
} from '@tensei/common'
import { isReadableStream, pipeline } from './LocalStorageDriver'

export class LocalStorageDriver
  implements StorageDriverInterface<LocalStorageConfig>
{
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

  async destroy(location: string, metadata?: any) {}
}

export class CloudinaryStorageDriver
  implements StorageDriverInterface<CloudinaryDriverInterface>
{
  config = {
    name: '',
    shortName: '',
    cloud_name: '',
    api_key: '',
    api_secret: ''
  }

  constructor(config?: Partial<CloudinaryDriverInterface>) {
    this.config.name = config?.name || 'Cloudinary'
    this.config.shortName = config?.shortName || paramCase(this.config.name)
    this.config.cloud_name = config?.cloud_name || ''
    this.config.api_key = config?.api_key || ''
    this.config.api_secret = config?.api_secret || ''
  }

  async upload(
    location: string,
    content: Buffer | NodeJS.ReadableStream | string
  ) {
    const cloudinary = require('cloudinary')

    cloudinary.config({
      cloud_name: this.config.cloud_name,
      api_key: this.config.api_key,
      api_secret: this.config.api_secret
    })

    if (isReadableStream(content)) {
      const uploadFunc = (content: NodeJS.ReadableStream) => {
        return new Promise((resolve, reject) => {
          let uploadStream = cloudinary.v2.uploader.upload_stream(
            (error: Error, result: { url: string }) => {
              if (result) {
                resolve(result)
              } else {
                reject(error)
              }
            }
          )

          content.pipe(uploadStream)
        })
      }
      try {
        let result: any = await uploadFunc(content)

        return { url: result.url }
      } catch (error: any) {
        console.log('an eror occured', error)
      }
    }
    return { url: '' }
  }
  destroy() {}
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

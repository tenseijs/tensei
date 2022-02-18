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
    cloudName: '',
    apiKey: '',
    apiSecret: ''
  }

  constructor(config?: Partial<CloudinaryDriverInterface>) {
    this.config.name = config?.name || 'Cloudinary'
    this.config.shortName = config?.shortName || paramCase(this.config.name)
    this.config.cloudName = config?.cloudName || ''
    this.config.apiKey = config?.apiKey || ''
    this.config.apiSecret = config?.apiSecret || ''
  }

  async upload(
    location: string,
    content: Buffer | NodeJS.ReadableStream | string
  ) {
    const cloudinary = require('cloudinary').v2
    const streamifier = require('streamifier')

    cloudinary.config({
      cloud_name: this.config.cloudName,
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret
    })

    const uploadFunc = (content: Buffer | NodeJS.ReadableStream | string) => {
      return new Promise((resolve, reject) => {
        let uploadStream = cloudinary.uploader.upload_stream(
          (error: any, result: any) => {
            if (result) {
              resolve(result)
            } else {
              reject(error)
            }
          }
        )
        if (isReadableStream(content)) {
          content.pipe(uploadStream)
        }

        if (Buffer.isBuffer(content)) {
          streamifier.createReadStream(content).pipe(uploadStream)
        }

        if (typeof content === 'string') {
          cloudinary.uploader.upload(content, (err: any, result: any) => {
            if (result) {
              resolve(result)
            } else {
              reject(err)
            }
          })
        }
      })
    }

    try {
      let result: any = await uploadFunc(content)

      return { url: result.url, metadata: result.public_id }
    } catch (error: any) {
      return error
    }
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

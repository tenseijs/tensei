import fse from 'fs-extra'
import { paramCase } from 'change-case'
import { join, sep, resolve, dirname } from 'path'
import {
  StorageDriverInterface,
  File,
  CloudinaryDriverInterface
} from '@tensei/common'
import { isReadableStream } from './StorageDriverUtils'

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
        location = location.split('.')[0]
        location = location.split('/')[1]

        let uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: location
          },
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

  destroy(file: File) {
    const cloudinary = require('cloudinary').v2

    cloudinary.config({
      cloud_name: this.config.cloudName,
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret
    })

    const deleteItem = (file: File) => {
      const location = `${file.hashPrefix ? file.hashPrefix : ''}${file.hash}`

      cloudinary.uploader.destroy(location, (err: any, result: any) => {
        if (err) {
          return err
        } else {
          return result
        }
      })
    }

    deleteItem(file)
  }
}

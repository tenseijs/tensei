import fse from 'fs-extra'
import { paramCase } from 'change-case'
import { join, sep, resolve, dirname } from 'path'
import {
  StorageDriverInterface,
  DefaultStorageResponse,
  S3StorageConfig
} from '@tensei/common'
import { isReadableStream } from './StorageDriverUtils'

export class S3StorageDriver
  implements StorageDriverInterface<S3StorageConfig> {

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

    // do the upload as not stream, but direct

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

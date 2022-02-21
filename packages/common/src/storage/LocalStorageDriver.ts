import fse from 'fs-extra'
import { paramCase } from 'change-case'
import { join, sep, resolve, dirname } from 'path'
import {
  StorageDriverInterface,
  LocalStorageConfig,
  DefaultStorageResponse,
  File
} from '@tensei/common'
import { isReadableStream, pipeline } from './StorageDriverUtils'

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

  destroy(file: File) { }
}

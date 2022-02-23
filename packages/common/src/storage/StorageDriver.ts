import fse from 'fs-extra'
import { paramCase } from 'change-case'
import { join, sep, resolve, dirname } from 'path'
import {
  DefaultStorageDriverConfig,
  StorageDriverInterface,
  StorageManagerInterface,
  LocalStorageConfig,
  DefaultStorageResponse,
  File
} from '@tensei/common'
import { isReadableStream, pipeline } from './StorageDriverUtils'

export class LocalStorageDriver
  implements StorageDriverInterface<LocalStorageConfig>
{
  config: LocalStorageConfig = {
    name: '',
    shortName: '',
    root: '',
    resolvedRoot: ''
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

  async destroy(file: File) {}
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

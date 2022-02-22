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
    root: '',
    resolvedRoot: ''
  }

  private _fullPath(relativePath: string): string {
    return join(this.config.resolvedRoot, join(sep, relativePath))
  }

  constructor(config?: Partial<LocalStorageConfig>) {
    this.config.name = config?.name || 'Local'
    this.config.shortName = config?.shortName || paramCase(this.config.name)
    this.config.root = config?.root! || 'public/storage'

    this.config.resolvedRoot = resolve(
      join(process.cwd(), config?.root!)
    )
  }

  async upload(
    location: string,
    content: Buffer | NodeJS.ReadableStream | string
  ): Promise<DefaultStorageResponse> {
    const fullPath = this._fullPath(location)

    const fileUrl = `${this.config?.tenseiConfig?.serverUrl}/${join(
      this.config.root,
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

  destroy(file: File) {

    const location = `${this.config.resolvedRoot}${file.path}${file.hashPrefix ?? ''}${file.hash}.${file.extension}`

    fse.unlink(location)

  }
}

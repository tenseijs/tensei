import {
  DefaultStorageDriverConfig,
  StorageDriverInterface,
  StorageManagerInterface
} from '@tensei/common'

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

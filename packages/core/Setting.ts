// schemas: [],
//             routes: [],
//             events: {},
//             root: process.cwd(),
//             emitter: new Emittery(),
//             name: process.env.APP_NAME || 'Tensei',
//             graphQlQueries: [],
//             graphQlTypeDefs: [],
//             graphQlMiddleware: [],
//             rootBoot: () => {},
//             rootRegister: () => {},
//             storage: new StorageManager(this.defaultStorageConfig),
//             storageConfig: this.defaultStorageConfig,
//             databaseClient: null,
//             serverUrl: '',
//             clientUrl: '',
//             resources: [],
//             plugins: [],
//             dashboards: [],
//             resourcesMap: {},
//             dashboardsMap: {},
//             orm: null,
//             databaseConfig: {
//                 type: 'sqlite',
//                 entities: []
//             },
//             scripts: [],
//             styles: [],
//             logger: pino({
//                 prettyPrint:
//                     process.env.NODE_ENV !== 'production'
//                         ? {
//                               ignore: 'pid,hostname,time'
//                           }
//                         : false
//             }),
//             indicative: {
//                 validator,
//                 sanitizer
//             },
//             graphQlExtensions: [],
//             extendGraphQlMiddleware: (...middleware: any[]) => {
//                 this.ctx.graphQlMiddleware = [
//                     ...this.ctx.graphQlMiddleware,
//                     ...middleware
//                 ]
//             },
//             extendResources: (resources: ResourceContract[]) => {
//                 this.resources(resources)
//             }
class Setting {
  config = {
    name: 'Tensei',
    server: '',
    client: ''
  }

  name(name: string) {
    this.config.name = name

    return this
  }

  server(path: string) {
    this.config.server = path

    return this
  }

  client(path: string) {
    this.config.client = path

    return this
  }
}

export default Setting

export const setting = new Setting()

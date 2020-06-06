import { Application } from 'express'

export interface FlamingoServiceProviderInterface {
  db: DatabaseRepository | null
  /**
   * This function should return an instance of the express application.
   * In case the user needs to pass in a custom express app,
   * this would be the place to do it.
   *
   */
  resourcesIn: (root: string) => string

  register: () => Promise<void>

  registerResources: () => Promise<any>

  launchServer: (serverCallback: (config: Config) => void) => void

  establishDatabaseConnection: () => Promise<DatabaseRepository>
}

export interface Config {
  databaseUri: string
  port: string | number
}

export interface Resource {}


export interface DatabaseRepository {}

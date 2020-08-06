import { FlamingoConfig, User } from '../config'
import { Resource } from '../resources/Resource'

export abstract class DatabaseRepositoryInterface {
    static databases: string[]
    abstract setup: (config: FlamingoConfig) => Promise<any>
    abstract establishDatabaseConnection: () => void
    abstract findUserByEmail: (email: string) => Promise<User|null>
    abstract getAdministratorsCount: () => Promise<number>
    abstract create: (resource: Resource, payload: {}) => Promise<any>
}

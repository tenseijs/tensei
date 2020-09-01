import { Mail } from '@tensei/mail'

import { Resource } from './resources/Resource'
import { ResourceManager } from './resources/ResourceManager'
import { User as BaseUser, Asset, Config } from './config'
import { DatabaseRepositoryInterface } from './databases/DatabaseRepositoryInterface'

export { id, ID } from './fields/ID'
export { text, Text } from './fields/Text'
export { link, Link } from './fields/Link'
export { Json, json } from './fields/Json'
export { date, DateField } from './fields/Date'
export { hasOne, HasOne } from './fields/HasOne'
export { select, Select } from './fields/Select'
export { hasMany, HasMany } from './fields/HasMany'
export { integer, Integer } from './fields/Integer'
export { number, NumberField } from './fields/Number'
export { dateTime, DateTime } from './fields/DateTime'
export { password, Password } from './fields/Password'
export { textarea, Textarea } from './fields/Textarea'
export { Field, SerializedField } from './fields/Field'
export { boolean, BooleanField } from './fields/Boolean'
export { belongsTo, BelongsTo } from './fields/BelongsTo'
export { timestamp, Timestamp } from './fields/Timestamp'
export { bigInteger, BigInteger } from './fields/BigInteger'
export { belongsToMany, BelongsToMany } from './fields/BelongsToMany'

export { ResourceManager } from './resources/ResourceManager'
export { action, SerializedAction, Action } from './actions/Action'
export {
    Plugin,
    plugin,
    PluginSetupConfig,
    SetupFunctions,
} from './plugins/Plugin'
export { resource, Resource, SerializedResource } from './resources/Resource'
export { DatabaseRepositoryInterface } from './databases/DatabaseRepositoryInterface'

declare global {
    namespace Tensei {
        interface User {}
    }
}

export interface User extends BaseUser {}

declare global {
    namespace Express {
        export interface Request {
            admin: User
            Mailer: Mail
            styles: Asset[]
            scripts: Asset[]
            appConfig: Config
            db: DatabaseRepositoryInterface
            administratorResource: Resource
            resourceManager: ResourceManager
            resources: Config['resourcesMap']
        }
    }
}

export * from './config'

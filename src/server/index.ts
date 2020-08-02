import Flamingo from './Flamingo'
import BaseResource from './resources/Resource'

import FlamingoServiceProvider from './providers/FlamingoServiceProvider'

export const flamingo = (
    root: string,
    ServiceProvider: typeof FlamingoServiceProvider
): Flamingo => {
    const flamingo = new Flamingo(root, ServiceProvider)

    return flamingo
}

export const Resource = BaseResource

export { ID } from './fields/ID'
export { Link } from './fields/Link'
export { Text } from './fields/Text'
export { Field } from './fields/Field'
export { HasOne } from './fields/HasOne'
export { Select } from './fields/Select'
export { DateField } from './fields/Date'
export { HasMany } from './fields/HasMany'
export { Integer } from './fields/Integer'
export { DateTime } from './fields/DateTime'
export { Password } from './fields/Password'
export { Textarea } from './fields/Textarea'
export { NumberField } from './fields/Number'
export { BelongsTo } from './fields/BelongsTo'
export { BigInteger } from './fields/BigInteger'
export { HasManyEmbedded } from './fields/HasManyEmbedded'

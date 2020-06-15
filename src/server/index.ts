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
export { Text } from './fields/Text'
export { Field } from './fields/Field'
export { DateField } from './fields/Date'
export { Password } from './fields/Password'
export { NumberField } from './fields/Number'
export { ObjectField } from './fields/Object'

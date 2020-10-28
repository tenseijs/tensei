import { Collection, ReferenceType, EntitySchema, wrap } from '@mikro-orm/core'

export class BaseEntity {
    constructor() {
        const props = wrap(this)

        console.log('@@@@@@@@@@@@@@@@@@@@@@', props)

        return

        // Object.keys(props).forEach(prop => {
        //     if ([ReferenceType.ONE_TO_MANY, ReferenceType.MANY_TO_MANY].includes(props[prop].reference)) {
        //         this[prop] = new Collection(this);
        //     }
        // })
    }
}

export default new EntitySchema({
    name: 'BaseEntity'
})

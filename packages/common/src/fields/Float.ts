import Integer from './Integer'

export class Float extends Integer {
    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.type = 'float'
        this.property.columnTypes = ['float']
    }
}

export const float = (name: string, databaseField?: string) =>
    new Float(name, databaseField)

export default Float

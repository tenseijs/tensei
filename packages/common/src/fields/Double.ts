import Integer from './Integer'

export class Double extends Integer {
    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.type = 'double'
        this.property.columnTypes = ['double']
    }
}

export const double = (name: string, databaseField?: string) =>
    new Double(name, databaseField)

export default Double

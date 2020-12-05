import Integer from './Integer'

export class BigInteger extends Integer {
    constructor(name: string, databaseField?: string) {
        super(name, databaseField)

        this.property.type = 'string'
        this.property.columnTypes = ['bigint']
    }
}

export const bigInteger = (name: string, databaseField?: string) =>
    new BigInteger(name, databaseField)

export default BigInteger

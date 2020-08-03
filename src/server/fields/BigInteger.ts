import Integer from '../fields/Integer'

export class BigInteger extends Integer {
    /**
     *
     * This would match the knex method name
     * on the create builder.
     */
    protected sqlDatabaseFieldType: string = 'bigInteger'
}

export const bigInteger = (name: string, databaseField?: string) =>
    BigInteger.make(name, databaseField)

export default BigInteger

import Integer from '../fields/Integer'

export class BigInteger extends Integer {
    /**
     * 
     * This would match the knex method name
     * on the create builder.
     */
    protected sqlDatabaseFieldType: string = 'bigInteger'
}

export default BigInteger

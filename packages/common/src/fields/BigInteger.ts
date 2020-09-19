import Integer from './Integer'

export class BigInteger extends Integer {
    /**
     *
     * This would match the knex method name
     * on the create builder.
     */
    public databaseFieldType: string = 'bigInteger'

    protected isRelationshipField: boolean = true

    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component: string = `${this.constructor.name}Field`
}

export const bigInteger = (name: string, databaseField?: string) =>
    new BigInteger(name, databaseField)

export default BigInteger

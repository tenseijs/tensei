import Field from './Field'
import { IDContract } from '@tensei/common'

interface Constructor<M> {
    new (...args: any[]): M
}

export class ID extends Field implements IDContract {
    /**
     *
     * If set to true, this field will
     * be cast to a string before
     * performing database
     * operations
     */
    public string: boolean = false

    /**
     * When a new ID field is created, by default,
     * we'll call the exceptOnForms() method.
     * That way, this field won't be
     * available on create
     * and update forms.
     */
    public constructor(name: string, databaseField?: string) {
        super(name, databaseField || 'id')

        this.primary()

        this.property.type = 'number'

        this.exceptOnForms()

        this.component = {
            form: 'ID',
            index: 'ID',
            detail: 'ID'
        }
    }

    public afterConfigSet() {
        if (this.tenseiConfig?.databaseConfig.type === 'mongo') {
            this.property.type = 'string'
        }
    }

    /**
     * Create a new instance of the field
     * requires constructor parameters
     *
     */
    public static make<T extends Field>(
        this: Constructor<T>,
        name?: string,
        databaseField?: string
    ): T {
        return new this(name || 'ID', databaseField || 'id')
    }
}

export const id = (name: string, databaseField?: string) =>
    ID.make(name, databaseField)

export default ID

import Integer from './Integer'

export class HasOne extends Integer {
    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'HasOneField'
}

export const hasOne = (name: string, databaseField?: string) =>
    new HasOne(name, databaseField)

export default HasOne

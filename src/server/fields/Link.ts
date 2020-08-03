import Text from './Text'
import Field from './Field'

export class Link extends Text {
    /**
     *
     * @param this
     */
    public rules<T extends Field>(this: T, ...rules: Array<string>): T {
        this.validationRules = ['url', ...rules]

        return this
    }
}

export const link = (name: string, databaseField?: string) =>
    Link.make(name, databaseField)

export default Link

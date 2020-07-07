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

export default Link

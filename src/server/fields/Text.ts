import Field from './Field'

class Text extends Field {
    /**
     *
     * Set a prefix to the text input on
     * the backend
     *
     */
    public withPrefix: string = ''

    /**
     *
     * Set a suffix to the text input on
     * the frontend
     */
    public withSuffix: string = ''

    /**
     *
     * An icon to append at the end of the
     * input
     *
     */
    public withIcon: string = ''

    /**
     * Set a prefix to the text input on
     * the backend
     *
     */
    public prefix(prefix: string) {
        this.withPrefix = prefix

        return this
    }

    /**
     *
     * Set a suffix to the text input on
     * the frontend
     */
    public suffix(suffix: string) {
        this.withSuffix = suffix

        return
    }

    /**
     *
     * Set an icon to be appended to input on
     * input on the frontend
     *
     */
    public icon(icon: string) {
        this.withIcon = icon

        return
    }

    /**
     *
     * Customize the serialize function to add
     * the suffix and prefix parameters
     */
    public serialize() {
        return {
            ...super.serialize(),

            prefix: this.withPrefix,
            suffix: this.withSuffix,
        }
    }
}

export default Text

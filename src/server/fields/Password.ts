import Text from './Text'

class Password extends Text {
    /**
     * Overrides the parent method
     * and sets the type of the
     * input to password
     */
    public htmlAttributes(attributes: {}) {
        this.attributes = {
            ...attributes,
            type: 'password'
        }

        return this
    }
}

export default Password

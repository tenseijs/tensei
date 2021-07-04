import Text from './Text'
import { DataPayload } from '@tensei/core'

export class Password extends Text {
  /**
   * When a new password is made, we'll set type
   * password as an html attribute
   *
   */
  public constructor(name: string, databaseField?: string) {
    super(name, databaseField)

    this.htmlAttributes({
      type: 'password'
    })
  }

  /**
   * If the password is empty, ignore it. Don't add it to the payload.
   */
  public getValueFromPayload(payload: DataPayload) {
    if (payload[this.databaseField]) {
      return payload[this.databaseField]
    }
  }
}

export const password = (name: string, databaseField?: string) =>
  new Password(name, databaseField)

export default Password

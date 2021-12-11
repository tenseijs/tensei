import Text from './Text'
import { DataPayload } from '@tensei/core'

export class Password extends Text {
  public component = {
    form: 'Password',
    index: 'Password',
    detail: 'Password'
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

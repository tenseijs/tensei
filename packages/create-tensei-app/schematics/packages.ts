/*
 * adonis-ts-boilerplate
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CliState } from '../contracts'

const TENSEI_PACKAGE_VERSION = 'latest'

export const packages: {
  [K in CliState['boilerplate']]: {
    [pkg: string]: { version: string }
  }
} = {
  graphql: {
    '@tensei/graphql': {
      version: TENSEI_PACKAGE_VERSION
    }
  },
  rest: {
    '@tensei/rest': {
      version: TENSEI_PACKAGE_VERSION
    }
  }
}

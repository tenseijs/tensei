/*
 * adonis-ts-boilerplate
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CliState } from '../contracts'

export const packages: {
  [K in CliState['boilerplate']]: {
    [pkg: string]: { version: string }
  }
} = {
  graphql: {
    '@tensei/graphql': {
      version: '^0.9.0'
    }
  },
  rest: {
    '@tensei/rest': {
      version: '^0.9.0'
    }
  }
}

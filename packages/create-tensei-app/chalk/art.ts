/*
 * create-adonis-ts-app
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
// @ts-ignore
import art from 'ascii-art'

export const showArt = () => {
  return new Promise((resolve, reject) => {
    art.font('Tensei.Js', 'doom', ((error: any, rendered: any) => {
      if (error) {
        return reject(error)
      }

      resolve(rendered)
    }) as any)
  })
}

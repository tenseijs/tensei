import Path from 'path'
import { plugin } from '@tensei/common'

export { mde as markdown } from './Mde'

export class MdePlugin {
  private config = {
    persistHtml: false
  }

  persistHtml() {
    this.config.persistHtml = true

    return this
  }

  plugin() {
    return plugin('Markdown Editor').register(({ script, style }) => {
      style('mde.css', Path.resolve(__dirname, '..', 'build/client/app.css'))
      script('mde.js', Path.resolve(__dirname, '..', 'build/client/app.js'))
    })
  }
}

export const mde = () => new MdePlugin()

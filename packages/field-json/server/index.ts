import Path from 'path'
import { plugin } from '@tensei/common'

class JsonPlugin {
  plugin() {
    return plugin('Field Json').register(({ script }) => {
      script('json.js', Path.resolve(__dirname, 'public/app.js'))
    })
  }
}

export const jsonPlugin = () => new JsonPlugin()

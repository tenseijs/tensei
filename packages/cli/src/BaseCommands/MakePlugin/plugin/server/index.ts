import { FileContent, MakePluginOptions } from '../../types'

export function serverIndex(options: MakePluginOptions): FileContent {
  const className = `${options.name.pascal}Plugin`

  return {
    content: `import Path from 'path'
import { plugin } from '@tensei/common'

class ${className} {
  plugin() {
    ${
      options.withFrontend
        ? `return plugin('${options.name.pascal} Plugin').register(({ script }) => {
      script('${options.name.camel}.js', Path.resolve(__dirname, 'public/app.js'))
    })`
        : `return plugin('${options.name.pascal} Plugin').register(({  }) => {
          
        })`
    }
  }
}

export const ${options.name.camel}Plugin = () => new ${className}()
`,
    location: options?.withFrontend ? 'server/index.ts' : 'src/index.ts',
    sides: ['backend', 'frontend']
  }
}

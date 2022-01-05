import { MakePluginOptions, FileContent } from '../../types'

export function clientIndexTsx(options: MakePluginOptions): FileContent {
  return {
    content: `import React from 'react'
const ${options.name.pascal}Field: React.FC<{}> = () => <div>${options.name.pascal} Field Component</div>

window.Tensei.register(({ formComponent }) => {
  formComponent("${options.name.pascal}", ${options.name.pascal}Field)
})
`,
    location: 'client/index.tsx',
    sides: ['frontend']
  }
}

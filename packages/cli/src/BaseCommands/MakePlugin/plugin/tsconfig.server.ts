import { MakePluginOptions, FileContent } from '../types'

export function tsconfigServer(options: MakePluginOptions): FileContent {
  return {
    content: `{
  "compilerOptions": {
    "target": "ES2017",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./build",
    "strict": true,
    "baseUrl": ${options.withFrontend ? '"./server"' : '"./src"'},
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "exclude": ["build"${options.withFrontend ? ', "client"' : ''}]
}`,
    location: options.withFrontend ? 'tsconfig.server.json' : 'tsconfig.json',
    sides: ['backend', 'frontend']
  }
}

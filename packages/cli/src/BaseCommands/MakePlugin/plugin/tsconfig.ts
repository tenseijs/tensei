import { MakePluginOptions, FileContent } from '../types'

export function tsconfigClient(options: MakePluginOptions): FileContent {
  return {
    content: `{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es5",
    "lib": ["es6", "dom"],
    "sourceMap": true,
    "allowJs": false,
    "jsx": "react",
    "declaration": false,
    "moduleResolution": "node",
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": false,
    "allowSyntheticDefaultImports": true
  },
  "exclude": ["server/"]
}`,
    location: 'tsconfig.json',
    sides: ['frontend']
  }
}

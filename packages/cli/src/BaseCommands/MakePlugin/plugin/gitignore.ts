import { FileContent } from '../types'

export function gitIgnore(): FileContent {
  return {
    content: `build/
node_modules/
mix-manifest.json`,
    location: '.gitignore',
    sides: ['frontend', 'backend']
  }
}

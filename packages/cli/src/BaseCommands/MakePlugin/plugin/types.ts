import { FileContent } from '../types'

export function types(): FileContent {
  return {
    content: `import { Tensei } from '@tensei/components'

declare global {
  interface Window {
    Tensei: Tensei
  }
}`,
    location: 'types.d.ts',
    sides: ['frontend']
  }
}

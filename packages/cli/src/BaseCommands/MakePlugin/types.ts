export interface MakePluginOptions {
  name: {
    default: string
    slug: string
    camel: string
    pascal: string
    capital: string
  }
  latestTenseiVersion: string
  withFrontend: boolean
  client: 'npm' | 'yarn'
}

export interface FileContent {
  content: string
  location: string
  sides: ('frontend' | 'backend')[]
}

import { graphql } from '@tensei/graphql'
import { PluginContract } from '@tensei/core'

import { setup as baseSetup } from '../../../helpers'

export * from '../../../helpers'

export const setup = (plugins: PluginContract[] = [], reset = true) =>
  baseSetup([...plugins, graphql().plugin()], reset)

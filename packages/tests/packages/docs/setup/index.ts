import { docs } from '@tensei/docs'
import { PluginContract } from '@tensei/core'

import { setup as baseSetup } from '../../../helpers'

export * from '../../../helpers'

export const setup = (plugins: PluginContract[] = [], reset = true) =>
    baseSetup([...plugins, docs().plugin()], reset)

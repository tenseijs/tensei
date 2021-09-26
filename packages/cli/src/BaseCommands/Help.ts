import { command } from '@tensei/common'

export const help = command('help')
  .describe('See help for all commands.')
  .run(function () {
    this.kernel.printHelp()
  })

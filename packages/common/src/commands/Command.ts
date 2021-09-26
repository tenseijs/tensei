import { CommandContract } from '@tensei/common'

import { BaseCommand } from './BaseCommand'

export class Command extends BaseCommand implements CommandContract {}

export const command = (name: string) => {
  const command = new Command()

  command.setName(name)

  return command
}

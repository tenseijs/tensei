import Yargs from 'yargs'

export const command = 'generate <type>'
export const aliases = ['g']
export const description = 'Save time by generating boilerplate code'

export const builder = (yargs: Yargs.Argv) => {
  yargs.commandDir('./generate', { recurse: true }).demandCommand()
}

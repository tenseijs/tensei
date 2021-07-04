import chalk from 'chalk'

export default {
  error: chalk.bold.red,
  warning: chalk.keyword('orange'),
  success: chalk.greenBright,
  info: chalk.grey,

  header: chalk.bold.underline.hex('#e8e8e8'),
  cmd: chalk.hex('#808080'),
  tensei: chalk.hex('#56b3e2'),
  love: chalk.redBright,

  green: chalk.green
}

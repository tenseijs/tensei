import { Config } from '@tensei/common'
import { MailConfig } from '@tensei/mail'
import { MailManager } from './MailManager'

export { ses } from './plugins/Ses'
export { smtp } from './plugins/Smtp'
export { mailgun } from './plugins/Mailgun'

export const mail = (config: MailConfig, logger: Config['logger'], mailsPath?: string) => new MailManager(config, logger, mailsPath)

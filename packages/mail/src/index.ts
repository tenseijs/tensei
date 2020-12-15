import { Config } from '@tensei/common'
import { MailConfig } from '@tensei/mail'
import { MailManager } from './Mail/MailManager'

export const mail = (config: MailConfig, logger: Config['logger']) => new MailManager(config, logger)

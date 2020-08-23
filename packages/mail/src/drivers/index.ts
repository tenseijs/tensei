import Ses from './Ses'
import Smtp from './Smtp'
import Mailgun from './Mailgun'
import Ethereal from './Ethereal'

export default {
    ses: Ses,
    smtp: Smtp,
    mailgun: Mailgun,
    ethereal: Ethereal
} as {
    [key: string]: any
}

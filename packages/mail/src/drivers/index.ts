import Ses from './Ses'
import Smtp from './Smtp'
import Mailgun from './Mailgun'
import Ethereal from './Ethereal'
import MemoryDriver from './Memory'

export default {
    ses: Ses,
    smtp: Smtp,
    mailgun: Mailgun,
    ethereal: Ethereal,
    memory: MemoryDriver,
} as {
    [key: string]: any
}

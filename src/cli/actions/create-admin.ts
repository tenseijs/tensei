import Chalk from 'chalk'
import Bcrypt from 'bcryptjs'
import Consola from 'consola'
import Readline from 'readline-sync'
import establishDbConnection from '../helpers/database'

export default async () => {
    const client = await establishDbConnection()

    Readline.setDefaultOptions({
        prompt: Chalk.green.bold('>'),
    })

    const firstName = Readline.question(
        Chalk.blue('> Enter your first name : ')
    )

    const lastName = Readline.question(Chalk.blue('> Enter your last name : '))

    const email = Readline.questionEMail(
        Chalk.blue('> Enter admin email address : ')
    )

    const password = Readline.questionNewPassword(
        Chalk.blue('> Enter a secure admin password : '),
        {
            confirmMessage: Chalk.blue('> Re-enter admin password again : '),
            unmatchMessage: Chalk.red(
                '> Password confirmation did not match :'
            ),
        }
    )

    const db = client.db()

    const existingUser = await db
        .collection('administrators')
        .findOne({ email })

    if (existingUser) {
        Consola.error('A user with this email already exists.')

        process.exit(1)
    }

    await db.collection('administrators').insertOne({
        email,
        lastName,
        firstName,
        password: Bcrypt.hashSync(password),
    })

    Consola.success('Administrator with email', email, 'has been created.')

    client.close()
}

import { Textarea } from '@tensei/common'

export class Mde extends Textarea {
    public component = {
        form: 'Mde',
        index: 'Mde',
        detail: 'Mde'
    }
}

export const mde = (name: string, databaseField?: string) =>
    new Mde(name, databaseField)

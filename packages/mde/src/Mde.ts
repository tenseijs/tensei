import { textarea } from '@tensei/common'

export const mde = (name: string, databaseField?: string) =>
    textarea(name, databaseField)
        .formComponent('Mde')
        .detailComponent('Mde')

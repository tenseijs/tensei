import ID from '../../fields/ID'
import Text from '../../fields/Text'

describe('The Field', () => {
    it('serialises correctly', () => {
        const textField = new Text('First name')

        expect(textField.serialize()).toEqual({
            showOnIndex: true,
            showOnDetail: true,
            showOnUpdate: true,
            showOnCreation: true,
            inputName: 'firstName',
            isSortable: false,
            defaultValue: '',
            component: 'TextField',
            name: 'First name',
            attributes: {},
            prefix: '',
            suffix: '',
            description: '',
        })
    })

    it('serialises custom fields correctly', () => {
        const textField = new Text('Email')

        textField
            .hideFromIndex()
            .showOnCreation()
            .hideWhenCreating()
            .onlyOnForms()
            .sortable()
            .default('john@example.com')

        expect(textField.serialize()).toEqual({
            showOnIndex: false,
            showOnDetail: false,
            showOnUpdate: true,
            showOnCreation: true,
            inputName: 'email',
            isSortable: true,
            component: 'TextField',
            defaultValue: 'john@example.com',
            name: 'Email',
            attributes: {},
            prefix: '',
            suffix: '',
            description: '',
        })
    })

    it('sets html attributes on field', () => {
        const textField = new Text('Last name')

        textField.htmlAttributes({
            placeholder: 'Enter your last name here',
        })

        expect(textField.serialize().attributes).toEqual({
            placeholder: 'Enter your last name here',
        })
    })
})

describe('The ID field', () => {
    it('makes with correct defaults', () => {
        const idField = ID.make()

        expect(idField.name).toBe('ID')
        expect(idField.databaseField).toBe('_id')
    })

    it('makes with default overrides', () => {
        const idField = ID.make('Custom ID', 'idField')

        expect(idField.name).toBe('Custom ID')
        expect(idField.databaseField).toBe('idField')
    })

    it('makes ID with default parameters', () => {
        const idField = ID.make()

        expect(idField.serialize().asString).toBe(false)
        expect(idField.serialize().asObjectId).toBe(true)
    })

    it('update ID cast type to string', () => {
        const idField = ID.make()

        idField.asString()

        expect(idField.serialize().asString).toBe(true)
        expect(idField.serialize().asObjectId).toBe(false)
    })

    it('update ID cast type to object id', () => {
        const idField = ID.make()

        idField.asObjectId()

        expect(idField.serialize().asString).toBe(false)
        expect(idField.serialize().asObjectId).toBe(true)
    })
})

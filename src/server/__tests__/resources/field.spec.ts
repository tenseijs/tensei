import Field from '../../resources/Field'

describe('The Field', () => {
    it('serialises correctly', () => {
        const field = new Field('First name')

        expect(field.serialize()).toEqual({
            showOnIndex: true,
            showOnDetail: true,
            showOnUpdate: true,
            showOnCreation: true,
            databaseField: 'firstName',
            isSortable: false,
            defaultValue: '',
            name: 'First name',
        })
    })

    it('serialises custom fields correctly', () => {
        const field = new Field('Email')

        field
            .hideFromIndex()
            .showOnCreation()
            .hideWhenCreating()
            .onlyOnForms()
            .sortable()
            .default('john@example.com')

        expect(field.serialize()).toEqual({
            showOnIndex: false,
            showOnDetail: false,
            showOnUpdate: true,
            showOnCreation: true,
            databaseField: 'email',
            isSortable: true,
            defaultValue: 'john@example.com',
            name: 'Email',
        })
    })
})

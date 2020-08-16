import React from 'react'
import { render, screen } from '@testing-library/react'
import TextField from '~/fields/Text'

const field = {
    attributes: {},
    component: 'TextField',
    creationRules: [],
    databaseField: 'title',
    defaultValue: '',
    description: '',
    fieldName: 'Text',
    inputName: 'title',
    isNullable: true,
    isRelationshipField: false,
    isSearchable: true,
    isSortable: true,
    isUnique: true,
    name: 'Title',
    rules: [('required', 'max:24')],
    showOnCreation: true,
    showOnDetail: true,
    showOnIndex: true,
    showOnUpdate: true,
    sqlDatabaseFieldType: 'string',
    updateRules: [],
}

const props = { field }

test('matches snapshot', () => {
    const { asFragment } = render(<TextField {...props} />)

    expect(asFragment).toMatchSnapshot()
})

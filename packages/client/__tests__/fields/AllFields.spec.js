import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import TextField from '~/fields/Text'
import TextAreaField from '~/fields/Textarea'
import SelectBox from '~/fields/Select'
import HasManyField from '~/fields/HasMany'
import DateTimeField from '~/fields/DateTime'
import BelongsToField from '~/fields/BelongsTo'

import { resources } from '~/testSetup/data'

const field = {
    attributes: {},
    component: 'TextField',
    creationRules: [],
    databaseField: 'title',
    defaultValue: '',
    description: 'The description for this field',
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
    databaseFieldType: 'string',
    updateRules: [],
}

const selectField = {
    attributes: {},
    creationRules: [],
    component: 'SelectField',
    databaseField: 'category',
    defaultValue: '',
    fieldName: 'Select',
    inputName: 'category',
    isNullable: true,
    isRelationshipField: false,
    selectOptions: [
        {
            label: 'Javascript',
            value: 'javascript',
        },
        {
            label: 'Angular',
            value: 'angular',
        },
    ],
    isSearchable: true,
    isSortable: true,
    isUnique: false,
    name: 'Category',
    rules: ['required'],
    showOnCreation: true,
    showOnDetail: true,
    showOnIndex: true,
    showOnUpdate: true,
    databaseFieldType: 'enu',
    updateRules: [],
}

const hasManyField = {
    attributes: {},
    creationRules: [],
    component: 'HasManyField',
    databaseField: 'posts',
    defaultValue: '',
    description: '',
    fieldName: 'HasMany',
    inputName: 'posts',
    isNullable: true,
    isRelationshipField: true,
    isSearchable: true,
    isSortable: true,
    isUnique: false,
    name: 'Post',
    rules: ['array'],
    showOnCreation: true,
    showOnDetail: true,
    showOnIndex: false,
    showOnUpdate: true,
    databaseFieldType: 'undefined',
    updateRules: [],
}

const belongsToManyField = {
    attributes: {},
    creationRules: [],
    component: 'BelongsToManyField',
    databaseField: 'posts',
    defaultValue: '',
    fieldName: 'BelongsToMany',
    inputName: 'posts',
    slug: 'posts',
    isNullable: true,
    isRelationshipField: false,
    selectOptions: [
        {
            label: 'Database',
            value: 'database',
        },
        {
            label: 'Testing',
            value: 'testing',
        },
    ],
    isSearchable: true,
    isSortable: true,
    isUnique: false,
    name: 'Post',
    rules: [],
    showOnCreation: true,
    showOnDetail: true,
    showOnIndex: true,
    showOnUpdate: true,
    databaseFieldType: 'enu',
    updateRules: [],
}

const dataTimeField = {
    attributes: {},
    creationRules: [],
    component: 'DateTimeField',
    databaseField: 'scheduled_for',
    defaultToNow: 'false',
    defaultValue: '08/20/2020',
    fieldName: 'DateTime',
    inputName: 'scheduled_for',
    format: 'do MMM yyyy, hh:mm a',
    firstDayOfWeek: 0,
    isNullable: true,
    isRelationshipField: false,
    selectOptions: [
        {
            label: 'Javascript',
            value: 'javascript',
        },
        {
            label: 'Angular',
            value: 'angular',
        },
    ],
    isSearchable: false,
    isSortable: false,
    isUnique: false,
    name: 'Scheduled For',
    pickerFormat: 'MM/dd/yyyy',
    rules: ['required', 'date'],
    showOnCreation: true,
    showOnDetail: true,
    showOnIndex: true,
    showOnUpdate: true,
    databaseFieldType: 'datetime',
    updateRules: [],
}

describe('Test the field components', () => {
    test('Test the Text field component', () => {
        const props = { field, onFieldChange: jest.fn() }

        const { asFragment } = render(<TextField {...props} />)
        const textInput = screen.getByLabelText('Title', { selector: 'input' })

        fireEvent.change(textInput, { target: { value: 'a new title' } })

        expect(asFragment).toMatchSnapshot()
        expect(screen.getByText(/title/i)).toBeInTheDocument()
        expect(textInput).toHaveValue('a new title')
        expect(textInput.type).toBe('text')
    })

    test('Test the TextArea field component', () => {
        const props = { field, onFieldChange: jest.fn(), value: '' }

        const { asFragment, rerender } = render(<TextAreaField {...props} />)
        const textArea = screen.getByRole('textbox', { name: 'title' })

        userEvent.type(textArea, 'a new content for the textarea')

        expect(asFragment).toMatchSnapshot()
        expect(textArea).toHaveValue('a new content for the textarea')

        props.errorMessage = 'the content is not valid'

        rerender(<TextAreaField {...props} />)

        expect(
            screen.getByText(/the content is not valid/i)
        ).toBeInTheDocument()
    })

    test('Test the Select field component', () => {
        const props = {
            field: selectField,
            onFieldChange: jest.fn(),
            value: '',
        }

        const { asFragment, rerender } = render(<SelectBox {...props} />)

        const selectBox = screen.getByRole('combobox', { name: 'category' })
        expect(asFragment).toMatchSnapshot()

        userEvent.selectOptions(selectBox, ['javascript'])

        expect(screen.getByText(/Javascript/i)).toBeInTheDocument()
        expect(screen.getByText(/Angular/i)).toBeInTheDocument()
        expect(screen.getAllByRole('option')).toHaveLength(
            selectField.selectOptions.length
        )

        delete selectField.selectOptions
        rerender(<SelectBox {...props} />)

        expect(screen.queryAllByRole('option')).toHaveLength(0)
    })
    test('Test the HasMany field component', () => {
        window.Tensei = {
            request: {
                get: jest.fn().mockResolvedValue({
                    status: 200,
                    data: {
                        data: [
                            {
                                title: 'a new title',
                                value: 'the value',
                            },
                        ],
                    },
                }),
            },
        }
        const props = {
            field: hasManyField,
            onFieldChange: jest.fn(),
            value: '',
            resources,
        }

        render(<HasManyField {...props} />)
        expect(window.Tensei.request.get).toHaveBeenCalledTimes(1)

        const autoCompleteBox = screen.getByPlaceholderText(
            'Type to search posts'
        )

        userEvent.type(autoCompleteBox, 'title')

        expect(window.Tensei.request.get).toHaveBeenCalledTimes(1)
    })
    test('Test the DateTime Field', () => {
        const props = {
            field: dataTimeField,
            onFieldChange: jest.fn(),
            value: '',
        }

        render(<DateTimeField {...props} />)

        const inputBox = screen.getByRole('textbox', { name: '' })
        const dateNumber = screen.getByText('15')

        userEvent.click(inputBox)
        userEvent.click(dateNumber)

        expect(screen.getByText('Scheduled For')).toBeInTheDocument()
    })
    test('Test the BelongsTo ', async () => {
        window.Tensei = {
            request: {
                get: jest.fn().mockResolvedValue({
                    status: 200,
                    data: {
                        data: [
                            {
                                title: 'a new title',
                                id: 'the value',
                            },
                        ],
                    },
                }),
            },
        }
        const props = {
            field: belongsToManyField,
            onFieldChange: jest.fn(),
            value: 'the value',
            resources,
        }

        const { rerender } = render(<BelongsToField {...props} />)
        expect(window.Tensei.request.get).toHaveBeenCalledTimes(1)
        const inputBox = screen.getByRole('searchbox', { name: 'Search' })

        await waitFor(() => expect(inputBox).toHaveValue('a new title'))

        const autoCompleteBox = screen.getByPlaceholderText(
            'Type to search posts'
        )

        userEvent.type(autoCompleteBox, 'a new')

        expect(screen.getByText('a new title')).toBeInTheDocument()
        expect(screen.getAllByRole('menuitem')).toHaveLength(1)

        // const toggleButton = screen.getByRole('button', {})

        // userEvent.click(toggleButton)

        props.field.isSearchable = false

        rerender(<BelongsToField {...props} />)

        const selectBox = screen.getByRole('combobox')
        userEvent.selectOptions(selectBox, ['the value'])

        expect(screen.getAllByRole('option')[1].selected).toBeTruthy()
    })
})

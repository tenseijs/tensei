import React, { useState, ChangeEvent, KeyboardEvent, useEffect } from 'react'
import {
    FormComponentProps,
    Label,
    TextInput,
    Button
} from '@tensei/components'
import { event } from '@tensei/common'

const FormArray: React.FC<FormComponentProps> = ({
    field,
    name,
    id,
    value,
    onChange,
    error
}) => {
    const [list, setList] = useState<string[]>(value || [])
    const [newItem, setNewItem] = useState('')
    const [values, setValues] = useState('')

    useEffect(() => {
        onChange(list)
    }, [list])

    const cross = (
        <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    )

    const onListItemUpdate = (
        event: ChangeEvent<HTMLInputElement>,
        changedIndex: number
    ) => {
        setList(
            list.map((item, idx) => {
                if (idx === changedIndex) {
                    return event.target.value
                }

                return item
            })
        )
    }

    const onListItemDelete = (deleteIndex: number) => {
        setList(list.filter((item, itemIndex) => itemIndex !== deleteIndex))
    }

    const onListItemAdded = () => {
        setList([...list, newItem])

        setNewItem('')
    }

    return (
        <>
            <Label label={field.name} id={id} />
            <div className="flex flex-wrap w-full">
                {list.map((item, itemIndex) => (
                    <div
                        key={itemIndex}
                        className="w-full flex items-center mb-2"
                    >
                        <TextInput
                            value={item}
                            onChange={event =>
                                onListItemUpdate(event, itemIndex)
                            }
                            
                            className="flex-1"
                            id={id}
                            name={name}
                        />
                        <Button
                            onClick={() => onListItemDelete(itemIndex)}
                            className="ml-2"
                            danger
                        >
                            {cross}
                        </Button>
                    </div>
                ))}
                <div className="w-full flex items-center">
                    <TextInput
                        placeholder={`Add a new ${field.name.toLowerCase()}`}
                        value={newItem}
                        onChange={event => setNewItem(event.target.value)}
                        onKeyDown = {(
                            event: KeyboardEvent<HTMLInputElement>
                            ) =>{{
                            if(event.keyCode === 13 && newItem !== "") {
                                onListItemAdded()
                            }
                        }}}
                        className="flex-1"
                        id={id}
                        name={name}
                    />
                    <Button
                        disabled={!newItem}
                        onClick={() => onListItemAdded()}
                        className="ml-2"
                        type="button"
                        primary
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </Button>
                </div>
                {error ? (
                    <i className="w-full text-tensei-error inline-block mt-2 text-sm">
                        {error}
                    </i>
                ) : null}
            </div>
        </>
    )
}

export default FormArray

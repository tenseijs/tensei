import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { ConfirmModal, Heading, StackedList, Button } from '@tensei/components'

import Resource from '../Resource'

export interface ResourceDetailProps {}

const ResourceDetail: React.FC<
    ResourceDetailProps &
        RouteComponentProps<{
            id: string
        }>
> = ({ match }) => {
    const [deleting, setDeleting] = useState<any>(null)

    if (['create', 'update'].includes(match.params.id)) {
        return null
    }

    return (
        <>
            <ConfirmModal
                open={!!deleting}
                setOpen={() => setDeleting(null)}
                title="Delete Account?"
                description="Are you sure you want to delete this account? This action cannot be reversed."
            />
            <header className="flex justify-between items-center mt-5">
                <Heading as="h1">Tag details</Heading>

                <div className="flex w-2/4 justify-end">
                    <Button danger>Delete</Button>
                    <Button primary className="ml-5">
                        Edit
                    </Button>
                </div>
            </header>

            <div className="bg-white rounded-lg shadow-sm border-tensei-gray-100 border my-10">
                <StackedList
                    fields={[
                        { inputName: 'id' },
                        { inputName: 'name' },
                        { inputName: 'email' },
                        { inputName: 'description' },
                        { inputName: 'phone_number' }
                    ]}
                />
            </div>

            <Resource />
        </>
    )
}

export default ResourceDetail

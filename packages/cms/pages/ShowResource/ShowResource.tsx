import React, { useState } from 'react'
import { ConfirmModal, Heading, StackedList, Button } from '@tensei/components'

import Actions from '../../components/Actions'
import Resource from '../Resource'

export interface ResourceDetailProps {}

const ResourceDetail: React.FC<ResourceDetailProps> = ({}) => {
    const [deleting, setDeleting] = useState<any>(null)

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
                    <Button primary className="ml-7">
                        Edit
                    </Button>
                </div>
            </header>

            <div className="bg-white rounded-lg shadow-sm border-tensei-gray-100 border my-10">
                <StackedList
                    fields={[
                        { inputName: 'name' },
                        { inputName: 'name' },
                        { inputName: 'name' },
                        { inputName: 'name' },
                        { inputName: 'name' }
                    ]}
                />
            </div>

            <Resource />
        </>
    )
}

export default ResourceDetail

import React, { useState, Fragment } from 'react'
import { Heading, Button, Paragraph. TextInput } from '@tensei/components'

interface CreateResourceProps {}

const CreateResource: React.FC<CreateResourceProps> = ({}) => {
    return (
        <Fragment>
            <header className="flex flex-wrap items-center justify-between">
                <Heading as="h1" className="text-tensei-darkest">
                    Update Tag
                </Heading>

                <div className="flex w-2/4 justify-end">
                    <Button
                        clear
                        className="bg-tensei-gray-300 border-tensei-gray-300"
                    >
                        Delete
                    </Button>
                    <Button primary className="ml-7">
                        Update
                    </Button>
                </div>
            </header>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col flex-wrap mt-10 bg-white rounded-lg p-12">
                    <Paragraph className="tensei-gray-700">
                        Put in information about the new
                    </Paragraph>

                    <div className="w-full md:w-2/3 mt-10">
                        <TextInput label="Title" />
                    </div>
                </div>
                <div className="bg-white rounded-lg p-12 mt-10">
                    5
                </div>
            </div>
        </Fragment>
    )
}

export default CreateResource

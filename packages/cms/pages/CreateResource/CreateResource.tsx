import React, { Fragment } from 'react'
import { Heading, Button } from '@tensei/components'

import PageWrapper from '../../components/PageWrapper'

interface CreateResourceProps {}

const CreateResource: React.FC<CreateResourceProps> = ({}) => {
    return (
        <PageWrapper>
            <header className="flex items-center justify-between">
                <Heading as="h1">Update Tag</Heading>

                <div className="flex">
                    <Button
                        clear
                        className="bg-tensei-gray-300 border-tensei-gray-300"
                    >
                        Delete
                    </Button>
                    <Button primary className="ml-5">
                        Update
                    </Button>
                </div>
            </header>
            <div className="flex flex-wrap md:flex-nowrap mt-10">
                <div className="flex flex-col flex-wrap w-full md:w-3/4 bg-white border border-tensei-gray-600 rounded-lg p-8 md:mr-4">
                    <div className="mb-5">
                        <window.Tensei.components.form.Text
                            label="Title"
                            name="title"
                            id="title"
                            placeholder="Enter your title"
                        />
                    </div>
                    <div className="mb-5">
                        <window.Tensei.components.form.Textarea
                            label="Body"
                            name="body"
                            id="body"
                            placeholder="Provide a full body"
                        />
                    </div>
                    <div className="mb-5">
                        <window.Tensei.components.form.Checkbox
                            label="Is active"
                            id="is_active"
                        />
                    </div>
                    <div className="mb-5">
                        <window.Tensei.components.form.Date
                            label="Birthday"
                            id="birthday"
                        />
                    </div>
                    <div className="mb-5">
                        <window.Tensei.components.form.Select
                            label="Active role"
                            id="role"
                            options={[
                                { label: 'Manager', value: 'manager' },
                                { label: 'Engineer', value: 'engineer' }
                            ]}
                        />
                    </div>
                    <div className="mb-5">
                        <window.Tensei.components.form.Mde
                            label="Blog Post Content"
                            id="blog_post_mde"
                        />
                    </div>
                </div>
                <div className="bg-white border border-tensei-gray-600 rounded-lg p-8 w-full md:w-1/4 mt-5 md:mt-0"></div>
            </div>
        </PageWrapper>
    )
}

export default CreateResource

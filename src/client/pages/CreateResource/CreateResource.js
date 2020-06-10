import React from 'react'
import { withResources } from 'store/resources'
import { Text } from 'office-ui-fabric-react/lib/Text'
import { TextField } from 'office-ui-fabric-react/lib/TextField'
import { DatePicker } from 'office-ui-fabric-react/lib/DatePicker'
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button'

class CreateResource extends React.Component {
    state = {
        resource: this.findResource()
    }

    findResource() {
        return this.props.resources.find(
            (resource) => resource.param === this.props.match.params.resource
        )
    }

    render() {
        const { resource } = this.state

        return (
            <React.Fragment>
                <header className="flex flex-wrap items-center justify-between">
                    <Text variant="xLarge">Create {resource.name}</Text>

                    <div className='w-full md:w-auto mt-4 md:mt-0'>
                        <DefaultButton className='mr-3'>
                            Reset
                        </DefaultButton>

                        <PrimaryButton>
                            <Text>Create {resource.name}</Text>
                        </PrimaryButton>
                    </div>
                </header>


                <div className="w-full flex flex-wrap mt-10">
                    <div className="w-full md:w-1/4 flex flex-col mb-5 md:mb-0">
                        <Text variant='large'>{resource.name}</Text>
                        <Text variant='medium' className='opacity-75'>Put in information about the new {resource.name.toLowerCase()}</Text>
                    </div>

                    <div className="w-full md:w-2/4 bg-white shadow px-6 py-6">
                        <TextField label='Name' description='Some information about the name field.'>

                        </TextField>

                        <div className="mt-2">
                            <TextField label='Email'>

                            </TextField>
                        </div>
                    </div>
                </div>

                <div className="w-full flex flex-wrap mt-10">
                    <div className="w-full md:w-1/4 flex flex-col mb-5 md:mb-0">
                        <Text variant='large'>{resource.name}</Text>
                        <Text variant='medium' className='opacity-75'>Put in information about the new {resource.name.toLowerCase()}</Text>
                    </div>

                    <div className="w-full md:w-2/4 bg-white px-6 py-6 shadow">
                        <TextField label='Name' description='Some information about the name field.'>

                        </TextField>

                        <div className="mt-2">
                            <DatePicker label='Published at' placeholder='Select a date'>

                            </DatePicker>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default withResources(CreateResource)

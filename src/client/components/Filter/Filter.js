import React, { Fragment } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { Text } from 'office-ui-fabric-react/lib/Text'
import {
    PrimaryButton,
    DefaultButton,
    CommandButton,
} from 'office-ui-fabric-react/lib/Button'
import {
    Dropdown,
    DropdownMenuItemType,
    IDropdownStyles,
    IDropdownOption,
} from 'office-ui-fabric-react/lib/Dropdown'
import { CircleAdditionIcon, RemoveIcon } from '@fluentui/react-icons'

class Filter extends React.Component {
    state = {
        filters: [
            {
                key: 1,
            },
        ],
    }

    renderActionButton = () => {
        const { showFilter } = this.props
        return (
            <div className="flex w-full md:w-auto mt-3 md:mt-0 justify-between">
                <DefaultButton onClick={showFilter}>Clear all</DefaultButton>
                <PrimaryButton className="md:ml-2">Apply</PrimaryButton>
            </div>
        )
    }

    addNewFilter = () => {
        this.setState({
            filters: [
                ...this.state.filters,
                {
                    key: 2,
                },
            ],
        })
    }

    render() {
        const { filters } = this.state
        const { resource, showFilter } = this.props
        return (
            <>
                <header className="flex flex-wrap w-full items-center justify-between">
                    <div className="flex w-full md:w-auto flex-col">
                        <Text variant="xLarge">
                            {`${resource.label} - Filters`}
                        </Text>
                        <Text variant="smallPlus">
                            Set the conditions to apply to filter the entries
                        </Text>
                    </div>
                    {this.renderActionButton()}
                </header>
                <div className="w-full mt-8 flex flex-col flex-wrap">
                    {filters.map((filter, index) => (
                        <div
                            key={filter.key}
                            className="w-full md:w-2/3 mt-2 flex flex-wrap justify-between items-center"
                        >
                            <Dropdown
                                placeholder="Select a field"
                                options={[]}
                                className="w-full md:w-auto md:flex-1"
                            />
                            <Dropdown
                                placeholder="Select a query"
                                options={[]}
                                className="w-full md:w-auto md:flex-1 md:ml-3 mt-3 md:mt-0"
                            />
                            <Dropdown
                                placeholder="Provide a value"
                                options={[]}
                                className="w-full md:w-auto md:flex-1 md:ml-3  mt-3 md:mt-0 md:mr-3"
                            />
                            {/* <RemoveIcon className="cursor-pointer hidden mt-2" /> */}
                            <CommandButton
                                className="mt-2 md:mt-0"
                                iconProps={{
                                    iconName: 'Remove',
                                }}
                            >
                                Remove filter
                            </CommandButton>
                        </div>
                    ))}

                    <CommandButton
                        onClick={this.addNewFilter}
                        className="mt-6 md:mt-3 md:w-1/12 w-full"
                        iconProps={{
                            iconName: 'Add',
                        }}
                    >
                        New filter
                    </CommandButton>
                </div>
            </>
        )
    }
}

export default Filter

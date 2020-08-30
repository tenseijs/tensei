import React from 'react'
import { debounce } from 'throttle-debounce'
import { withResources } from '~/store/resources'
import { Pill, TextLink } from '@contentful/forma-36-react-components'
import Autocomplete from '~/components/Autocomplete'
import { Link } from 'react-router-dom'

class HasMany extends React.Component {
    state = {
        isLoading: true,
        options: [],
        selectedOptions: [],
        relatedResource: null,
    }

    findRelatedResource = () => {
        return this.props.resources.find(
            (relatedResource) => relatedResource.name === this.props.field.name
        )
    }

    componentDidMount() {
        this.setState(
            {
                relatedResource: this.findRelatedResource(),
            },
            () => {
                this.fetchOptions()

                if (this.props.editingState) {
                    this.fetchSelectedOptions()
                }
            }
        )
    }

    fetchSelectedOptions = () => {
        const { relatedResource } = this.state
        const { resource, resourceId, field: fieldProp } = this.props

        const relatedBelongsToField = relatedResource.fields.find(
            (field) =>
                field.name === resource.name &&
                field.component === 'BelongsToField'
        )

        if (!relatedBelongsToField) {
            return
        }

        Tensei.request
            .get(
                `resources/${relatedResource.slug}/${resourceId}/${
                    relatedResource.slug
                }?fields=${[
                    relatedResource.displayField,
                    relatedResource.valueField,
                ].join(',')}&per_page=${relatedResource.perPageOptions[0]}`
            )
            .then(({ data }) => {
                this.setState(
                    {
                        selectedOptions: data.data.map((option) => ({
                            label: option[relatedResource.displayField],
                            value: option[relatedResource.valueField],
                        })),
                    },
                    () =>
                        this.props.onFieldChange(
                            this.state.selectedOptions.map(
                                (option) => option.value
                            )
                        )
                )
            })
    }

    fetchOptions = (query) => {
        const { relatedResource } = this.state

        Tensei.request
            .get(
                `resources/${relatedResource.slug}?fields=${[
                    relatedResource.displayField,
                    relatedResource.valueField,
                ].join(',')}&search=${query || ''}`
            )
            .then(({ data }) => {
                this.setState({
                    isLoading: false,
                    options: data.data.map((option) => ({
                        label: option[relatedResource.displayField],
                        value: option[relatedResource.valueField],
                    })),
                })
            })
    }

    onQueryChange = debounce(500, (query) => {
        this.setState({
            isLoading: true,
        })
        this.fetchOptions(query)
    })

    onAutocompleteChange = (selectedOption) => {
        console.log('this is the auto complete')
        this.setState(
            {
                selectedOptions: [
                    ...this.state.selectedOptions,
                    selectedOption,
                ],
            },
            () =>
                this.props.onFieldChange(
                    this.state.selectedOptions.map((option) => option.value)
                )
        )
    }

    removeOption = (optionToRemove) => {
        this.setState(
            {
                selectedOptions: this.state.selectedOptions.filter(
                    (option) => option.value !== optionToRemove.value
                ),
            },
            () =>
                this.props.onFieldChange(
                    this.state.selectedOptions.map((option) => option.value)
                )
        )
    }

    optionsToRender = () => {
        const selectedOptions = this.state.selectedOptions.map(
            (selectedOption) => selectedOption.value
        )

        return this.state.options.filter(
            (option) => !selectedOptions.includes(option.value)
        )
    }

    render() {
        const { field, errorMessage, resource, resourceId } = this.props
        const { isLoading, relatedResource, selectedOptions } = this.state

        return (
            <div className="TextField">
                <div className="TextField__label-wrapper">
                    <label className="FormLabel" htmlFor={field.inputName}>
                        {field.name}
                    </label>
                </div>

                <Autocomplete
                    onChange={this.onAutocompleteChange}
                    items={this.optionsToRender()}
                    isLoading={isLoading}
                    width="full"
                    validationMessage={errorMessage}
                    dropdownProps={{ isFullWidth: true }}
                    onQueryChange={this.onQueryChange}
                    textInputProps={() => ({
                        placeholder: `Type to search ${
                            relatedResource
                                ? relatedResource.label.toLowerCase()
                                : ''
                        }`,
                    })}
                >
                    {(options) =>
                        this.optionsToRender().map((option) => (
                            <span key={option.value}>{option.label}</span>
                        ))
                    }
                </Autocomplete>

                {selectedOptions.length > 0 ? (
                    <>
                        <div className="flex flex-wrap mt-4">
                            {selectedOptions.map((option) => (
                                <Pill
                                    className="mr-2 mt-2"
                                    key={option.value}
                                    onClose={() => this.removeOption(option)}
                                    label={option.label}
                                />
                            ))}
                        </div>
                        {/* TODO: Make 20 customizable. Probably use the defaultPerPage of the resource */}
                        {selectedOptions.length > 20 ? (
                            <TextLink className="mt-2">
                                <Link
                                    to={Tensei.getPath(
                                        `resources/${resource.slug}/${resourceId}`
                                    )}
                                >
                                    View all{' '}
                                    {relatedResource
                                        ? relatedResource.label.toLowerCase()
                                        : null}
                                </Link>
                            </TextLink>
                        ) : null}
                    </>
                ) : null}
            </div>
        )
    }
}

export default withResources(HasMany)

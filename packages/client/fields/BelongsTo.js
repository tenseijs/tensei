import React from 'react'
import { debounce } from 'throttle-debounce'
import { withResources } from '~/store/resources'
import {
    Select,
    Option,
    TextInput,
    IconButton,
} from '@contentful/forma-36-react-components'
import Autocomplete from '~/components/Autocomplete'

class BelongsTo extends React.Component {
    state = {
        isLoading: true,
        options: [],
        textValue: '',
        selectedOption: null,
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
            () => this.fetchOptions()
        )
    }

    fetchOptions = (query) => {
        const { relatedResource } = this.state

        Flamingo.request
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
        this.props.onFieldChange(selectedOption ? selectedOption.value : null)

        this.setState({
            selectedOption,
            textValue: selectedOption ? selectedOption.label : '',
        })
    }

    render() {
        const { field, value, onFieldChange, errorMessage } = this.props
        const {
            options,
            isLoading,
            relatedResource,
            textValue,
            selectedOption,
        } = this.state

        return (
            <div className="TextField">
                <div className="TextField__label-wrapper">
                    <label className="FormLabel" htmlFor={field.inputName}>
                        {field.name}
                    </label>
                </div>

                {field.isSearchable ? (
                    <Autocomplete
                        onChange={this.onAutocompleteChange}
                        items={options}
                        isLoading={isLoading}
                        width="full"
                        onIconClick={(toggleProps) => {
                            if (selectedOption) {
                                this.onAutocompleteChange(null)
                            } else {
                                toggleProps.onToggle()
                            }
                        }}
                        iconProps={(toggleProps) => ({
                            icon:
                                toggleProps.query || selectedOption
                                    ? 'Close'
                                    : 'ChevronDown',
                        })}
                        onDropdownClose={() => {
                            this.setState({
                                textValue: selectedOption
                                    ? selectedOption.label
                                    : '',
                            })
                        }}
                        validationMessage={errorMessage}
                        dropdownProps={{ isFullWidth: true }}
                        onQueryChange={this.onQueryChange}
                        textInputProps={(toggleProps) => ({
                            value: toggleProps.query
                                ? toggleProps.query
                                : textValue,
                            onClick: () => this.setState({ textValue: '' }),
                            placeholder: `Type to search ${
                                relatedResource
                                    ? relatedResource.label.toLowerCase()
                                    : ''
                            }`,
                        })}
                    >
                        {(options) =>
                            options.map((option) => (
                                <span key={option.value}>{option.label}</span>
                            ))
                        }
                    </Autocomplete>
                ) : null}

                {!field.isSearchable ? (
                    <Select
                        onChange={(event) => onFieldChange(event.target.value)}
                        value={value}
                    >
                        {options.map((option) => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                ) : null}
            </div>
        )
    }
}

export default withResources(BelongsTo)

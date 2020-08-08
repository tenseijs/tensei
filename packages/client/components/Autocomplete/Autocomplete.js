import cn from 'classnames'
import React, { useMemo, useReducer, useRef } from 'react'

import {
    TextInput,
    Dropdown,
    DropdownList,
    SkeletonBodyText,
    SkeletonContainer,
    IconButton,
    DropdownListItem,
    ValidationMessage,
} from '@contentful/forma-36-react-components'

const KEY_CODE = {
    ENTER: 13,
    ARROW_DOWN: 40,
    ARROW_UP: 38,
    TAB: 9,
}

const TOGGLED_LIST = 'TOGGLED_LIST'
const NAVIGATED_ITEMS = 'NAVIGATED_ITEMS'
const QUERY_CHANGED = 'QUERY_CHANGED'
const ITEM_SELECTED = 'ITEM_SELECTED'

const initialState = {
    isOpen: false,
    query: '',
    highlightedItemIndex: null,
}

const reducer = (state, action) => {
    switch (action.type) {
        case TOGGLED_LIST:
            return {
                ...state,
                isOpen: action.payload,
                highlightedItemIndex: null,
            }
        case NAVIGATED_ITEMS:
            return {
                ...state,
                isOpen: true,
                highlightedItemIndex: action.payload,
            }
        case QUERY_CHANGED:
            return {
                ...state,
                highlightedItemIndex: null,
                isOpen: true,
                query: action.payload,
            }
        case ITEM_SELECTED:
            return { ...initialState }
        default:
            return state
    }
}

export const Autocomplete = ({
    children,
    items = [],
    disabled,
    onChange,
    onQueryChange,
    placeholder = 'Search',
    name = 'Search',
    width,
    maxHeight,
    isLoading,
    onIconClick,
    iconProps,
    validationMessage,
    emptyListMessage = 'No options',
    noMatchesMessage = 'No matches',
    willClearQueryOnClose,
    dropdownProps,
    renderToggleElement,
    textInputProps,
    onDropdownClose,
}) => {
    const listRef = useRef()
    const inputRef = useRef()

    const [{ isOpen, query, highlightedItemIndex }, dispatch] = useReducer(
        reducer,
        initialState
    )

    const toggleList = (isOpen) => {
        dispatch({ type: TOGGLED_LIST, payload: isOpen })
    }

    const selectItem = (item) => {
        dispatch({ type: ITEM_SELECTED })
        onQueryChange('')
        onChange(item)
    }

    const updateQuery = (value) => {
        dispatch({ type: QUERY_CHANGED, payload: value })
        onQueryChange(value)
    }

    const handleKeyDown = (event) => {
        const isEnter = event.keyCode === KEY_CODE.ENTER
        const isTab =
            event.keyCode === KEY_CODE.TAB ||
            (event.keyCode === KEY_CODE.TAB && event.shiftKey)

        const hasUserSelection = highlightedItemIndex !== null
        const lastIndex = items.length ? items.length - 1 : 0
        const direction = getNavigationDirection(event)

        if (direction) {
            const newIndex = getNewIndex(
                highlightedItemIndex,
                direction,
                lastIndex
            )
            if (listRef.current) {
                scrollToItem(listRef.current, newIndex)
            }
            dispatch({ type: NAVIGATED_ITEMS, payload: newIndex })
        } else if (isEnter && hasUserSelection) {
            const selected = items[highlightedItemIndex]
            selectItem(selected)
        } else if (isTab) {
            toggleList(false)
        }
    }

    const handleInputButtonClick = () => {
        query ? updateQuery('') : toggleList()
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    function renderDefaultToggleElement(toggleProps) {
        return (
            <div className="AutocompleteInput">
                <TextInput
                    value={toggleProps.query}
                    onChange={(e) => toggleProps.onChange(e.target.value)}
                    onFocus={toggleProps.onFocus}
                    onKeyDown={toggleProps.onKeyDown}
                    disabled={toggleProps.disabled}
                    placeholder={toggleProps.placeholder}
                    width={toggleProps.width}
                    inputRef={toggleProps.inputRef}
                    testId="autocomplete.input"
                    type="search"
                    error={!!validationMessage}
                    autoComplete="off"
                    aria-label={toggleProps.name}
                    {...(textInputProps ? textInputProps(toggleProps) : {})}
                />
                <IconButton
                    className={'InputIconButton'}
                    tabIndex={-1}
                    buttonType="muted"
                    iconProps={{
                        icon: toggleProps.query ? 'Close' : 'ChevronDown',
                        ...(iconProps ? iconProps(toggleProps) : {}),
                    }}
                    onClick={() => {
                        if (onIconClick) {
                            onIconClick(toggleProps)
                        } else {
                            toggleProps.onToggle()
                        }
                    }}
                    label={toggleProps.query ? 'Clear' : 'Show list'}
                />
            </div>
        )
    }

    const toggleProps = {
        name,
        query,
        disabled,
        placeholder,
        width,
        onChange: updateQuery,
        onFocus: () => toggleList(true),
        onKeyDown: handleKeyDown,
        onToggle: handleInputButtonClick,
        inputRef: inputRef,
    }

    const renderToggleElementFunction =
        renderToggleElement || renderDefaultToggleElement

    return (
        <>
            <Dropdown
                className={'AutocompleteDropdown'}
                isOpen={isOpen}
                onClose={() => {
                    willClearQueryOnClose && updateQuery('')
                    dispatch({ type: TOGGLED_LIST })

                    onDropdownClose && onDropdownClose()
                }}
                toggleElement={renderToggleElementFunction(toggleProps)}
                {...dropdownProps}
            >
                <DropdownList
                    testId="autocomplete.dropdown-list"
                    maxHeight={maxHeight}
                >
                    <div ref={listRef}>
                        {!items.length && !isLoading && (
                            <DropdownListItem
                                isDisabled
                                testId="autocomplete.empty-list-message"
                            >
                                {query ? noMatchesMessage : emptyListMessage}
                            </DropdownListItem>
                        )}
                        {isLoading ? (
                            <OptionSkeleton />
                        ) : (
                            items.map(({ label, value }, index) => {
                                const isActive = index === highlightedItemIndex
                                return (
                                    <DropdownListItem
                                        key={index}
                                        isActive={isActive}
                                        data-selected={isActive} // this should be coming from the component library
                                        onClick={() =>
                                            selectItem({ label, value })
                                        }
                                        testId="autocomplete.dropdown-list-item"
                                    >
                                        <span key={value}>{label}</span>
                                    </DropdownListItem>
                                )
                            })
                        )}
                    </div>
                </DropdownList>
            </Dropdown>

            {validationMessage ? (
                <ValidationMessage className="TextFieldValidationMessage">
                    {validationMessage}
                </ValidationMessage>
            ) : null}
        </>
    )
}

function OptionSkeleton() {
    return (
        <>
            <DropdownListItem>
                <SkeletonContainer svgWidth="200" svgHeight={20}>
                    <SkeletonBodyText numberOfLines={1} />
                </SkeletonContainer>
            </DropdownListItem>
            <DropdownListItem>
                <SkeletonContainer svgWidth="100" svgHeight={20}>
                    <SkeletonBodyText numberOfLines={1} />
                </SkeletonContainer>
            </DropdownListItem>
            <DropdownListItem>
                <SkeletonContainer svgWidth="150" svgHeight={20}>
                    <SkeletonBodyText numberOfLines={1} />
                </SkeletonContainer>
            </DropdownListItem>
        </>
    )
}

function getNavigationDirection(event) {
    if (event.keyCode === KEY_CODE.ARROW_DOWN) {
        return Direction.DOWN
    }

    if (event.keyCode === KEY_CODE.ARROW_UP) {
        return Direction.UP
    }

    return null
}

// Get next navigation index based on current index and navigation direction
function getNewIndex(currentIndex, direction, lastIndex) {
    const isDown = direction === Direction.DOWN
    const isUp = direction === Direction.UP
    const hasNoUserSelection = currentIndex === null
    const isLast = currentIndex === lastIndex
    const isFirst = currentIndex === 0

    if (isDown && (hasNoUserSelection || isLast)) {
        return 0
    }

    if (isUp && (hasNoUserSelection || isFirst)) {
        return lastIndex
    }

    return currentIndex + direction
}

// Find the DOM node at index and scroll if necessary
function scrollToItem(list, index) {
    if (!list || !list.children.length) {
        return
    }

    const item = list.children[index]
    item.scrollIntoView({ block: 'nearest' })
}

export default Autocomplete

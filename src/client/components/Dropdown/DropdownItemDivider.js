import React from 'react'

/**
 * Used to seperate items within a Dropdown with a horizontal line
 */
function DropdownItemDivider(props) {
    return <div className="dropdown-divider">{props.children}</div>
}

DropdownItemDivider.displayName = 'Dropdown.ItemDivider'

export default DropdownItemDivider

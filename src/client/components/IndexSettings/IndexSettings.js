import React from 'react'
import {
    Dialog,
    DialogType,
    DialogFooter,
} from 'office-ui-fabric-react/lib/Dialog'
import {
    Dropdown,
    DropdownMenuItemType,
} from 'office-ui-fabric-react/lib/Dropdown'
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button'

class IndexSettings extends React.Component {
    state = {}

    render() {
        return (
            <Dialog
                isOpen={true}
                maxWidth={'768px'}
                styles={{
                    className: 'w-full',
                }}
                onDismiss={console.log}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: this.props.title,
                    closeButtonAriaLabel: 'Discard changes',
                }}
                modalProps={{
                    styles: {
                        main: {
                            maxWidth: '600px',
                        },
                    },
                }}
            >
                <Dropdown
                    label="Displayed fields"
                    defaultSelectedKeys={['apple', 'banana', 'grape']}
                    multiSelect
                    options={[
                        {
                            key: 'orange',
                            text: 'Orange',
                        },
                    ]}
                    // styles={dropdownStyles}
                />
                <DialogFooter className="mt-12">
                    <PrimaryButton text="Save changes" />
                    <DefaultButton
                        // onClick={toggleHideDialog}
                        text="Discard"
                    />
                </DialogFooter>
            </Dialog>
        )
    }
}

export default IndexSettings

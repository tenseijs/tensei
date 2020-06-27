import React from 'react'
import Avatar from 'components/Avatar'
import Dropdown from 'components/Dropdown'

const defaultOptions = {
    profile: { icon: 'user', value: 'Profile', to: '/profile' },
    settings: { icon: 'settings', value: 'Settings', to: '/settings' },
    mail: { icon: 'mail', value: 'Inbox', to: '/mail' },
    message: { icon: 'send', value: 'Message', to: '/message' },
    help: { icon: 'help-circle', value: 'Need help?', to: '/help' },
    logout: { icon: 'log-out', value: 'Sign out', to: '/logout' },
    divider: { isDivider: true },
}

const itemsFromDefaultOptions = (options) =>
    options.map((opt) => (typeof opt === 'string' ? defaultOptions[opt] : opt))

/**
 * A component for fast creation of an account centric dropdown
 */
function AccountDropdown({
    avatarURL,
    name,
    type,
    description,
    options = [],
    optionsRootComponent,
}) {
    const itemsObjects = itemsFromDefaultOptions(options)

    return (
        <Dropdown
            isNavLink
            type={type}
            triggerClassName="pr-0 leading-none d-flex lh-1 text-reset p-0"
            triggerContent={
                <React.Fragment>
                    {avatarURL && <Avatar imageURL={avatarURL} />}
                    <div className="d-none d-xl-block pl-2">
                        <div className="text-default">{name}</div>
                        <small className="mt-1 small text-muted">
                            {description}
                        </small>
                    </div>
                </React.Fragment>
            }
            position="bottom-end"
            arrow={true}
            arrowPosition="right"
            toggle={false}
            itemsObject={itemsObjects}
            itemsRootComponent={optionsRootComponent}
        />
    )
}

export default AccountDropdown

import cn from 'classnames'
import React, { Fragment } from 'react'
import { Link, Route } from 'react-router-dom'
import {
    Dropdown,
    DropdownList,
    DropdownListItem,
    Paragraph,
} from '@contentful/forma-36-react-components'

import ResourceIndex from '../ResourceIndex'
import CreateResource from '../CreateResource'

import { withResources } from '../../store/resources'
import { mustBeAuthenticated } from '../../store/auth'

import ArrowIcon from 'components/ArrowIcon'

class DashboardPage extends React.Component {
    state = {
        accountMenuOpen: false,
        groups: [
            {
                name: 'Dashboard',
                open: true,
                slug: 'dashboard',
                items: [
                    {
                        slug: 'home',
                        label: 'Home',
                        to: '/',
                    },
                ],
            },
            {
                name: 'Resources',
                open: true,
                slug: 'resources',
                items: this.props.resources.map((resource) => ({
                    slug: resource.collection,
                    to: `/resources/${resource.collection}`, // TODO: Add a resource slug to the backend.
                    label: resource.label,
                })),
            },
        ],
    }

    logout = () => {
        console.log(this.props)

        Flamingo.request.post('logout')
            .then(() => {
                window.location.href = '/auth/login'
            })
    }

    toggleAccountMenu = () => {
        this.setState({
            accountMenuOpen: !this.state.accountMenuOpen,
        })
    }

    toggleGroup = (groupToToggle) => {
        this.setState({
            groups: this.state.groups.map((group) => {
                if (group.slug === groupToToggle.slug) {
                    return {
                        ...group,
                        open: !group.open,
                    }
                }

                return group
            }),
        })
    }

    renderGroups = () => {
        return (
            <>
                {this.state.groups.map((group) => (
                    <Fragment key={group.slug}>
                        <header
                            onClick={() => this.toggleGroup(group)}
                            className="flex items-center border-b border-gray-lightest-100 p-3 cursor-pointer hover:bg-gray-lightest-100 transition duration-75 w-full cursor-pointer uppercase text-blue-darkest-200 font-bold text-xs"
                        >
                            <ArrowIcon
                                className={cn(
                                    'mr-3 transition duration-75 transform text-blue-darkest',
                                    {
                                        '-rotate-90': !group.open,
                                    }
                                )}
                            />
                            {group.name}
                        </header>
                        {group.open &&
                            group.items.map((item) => (
                                <Link key={item.slug} to={item.to}>
                                    <div
                                        className={cn(
                                            'w-full py-3 pl-10 pr-3 text-sm cursor-pointer hover:bg-gray-lightest-200 transition duration-75',
                                            {
                                                'bg-gray-lightest-100':
                                                    this.props.location
                                                        .pathname === item.to,
                                            }
                                        )}
                                    >
                                        {item.label}
                                    </div>
                                </Link>
                            ))}
                    </Fragment>
                ))}
            </>
        )
    }

    render() {
        const { accountMenuOpen } = this.state
        return (
            <div className="w-full">
                <div className="w-full h-topbar bg-blue-darkest flex items-center text-white justify-between">
                    <span></span>
                    <span></span>
                    <div>
                        <Dropdown
                            isOpen={accountMenuOpen}
                            onClose={this.toggleAccountMenu}
                            isAutoalignmentEnabled={true}
                            toggleElement={
                                <div
                                    onClick={this.toggleAccountMenu}
                                    className={cn(
                                        'shadow-account-menu cursor-pointer px-5 h-topbar flex items-center justify-center',
                                        {
                                            'bg-blue-darkest-200 hover:bg-blue-darkest-300': !accountMenuOpen,
                                            'bg-blue-darkest-300': accountMenuOpen,
                                        }
                                    )}
                                >
                                    <img
                                        className="w-8 h-8 rounded-full"
                                        src="https://avatars.githubusercontent.com/u/19477966?v=3"
                                        alt=""
                                    />
                                    <ArrowIcon className="ml-3 text-white w-4 h-4" />
                                </div>
                            }
                        >
                            <DropdownList>
                                <DropdownListItem onClick={console.log}>
                                    Account settings
                                </DropdownListItem>
                            </DropdownList>
                            <DropdownList border="top">
                                <DropdownListItem onClick={this.logout}>
                                    Logout
                                </DropdownListItem>
                            </DropdownList>
                        </Dropdown>
                    </div>
                </div>

                <div
                    className="w-full flex flex-wrap"
                    style={{ height: 'calc(100vh - 4.375rem)' }}
                >
                    <div className="border-r border-gray-lighter h-full bg-gray-lightest w-full md:w-18-percent">
                        {this.renderGroups()}
                    </div>
                    <div className="w-full md:w-auto flex-grow h-full overflow-scroll">
                        <div className="py-4 px-3 pt-8 pb-12 md:px-12">
                            <Route
                                exact
                                path="/resources/:resource"
                                component={ResourceIndex}
                            />
                            <Route
                                path="/resources/:resource/new"
                                component={CreateResource}
                            />
                            <div className="w-full flex items-center justify-center py-3 mt-24">
                                <Paragraph variant="small">
                                    © Flamingo Admin {new Date().getFullYear()}
                                </Paragraph>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withResources(mustBeAuthenticated(DashboardPage))

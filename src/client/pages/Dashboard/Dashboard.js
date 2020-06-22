import React from 'react'
import { Link, Route } from 'react-router-dom'
import { Text } from 'office-ui-fabric-react/lib/Text'
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona'
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox'
import { NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors'

import ResourceIndex from '../ResourceIndex'
import CreateResource from '../CreateResource'

import { withResources } from '../../store/resources'
import { mustBeAuthenticated } from '../../store/auth'

class DashboardPage extends React.Component {
    render() {
        return (
            <div className="w-full">
                <div
                    className="flex flex-wrap min-h-screen h-screen relative"
                >
                    <div className="w-full md:w-56 h-full md:fixed overflow-scroll text-white bg-blue-darkest">
                        <div className="flex items-center px-6 w-full h-12 bg-blue-primary">
                            <Text variant='large' className='font-bold'>Flamingo</Text>
                        </div>

                        <div className="py-5 px-6">
                            <span className="flex items-center text-xs uppercase opacity-75">
                                <svg
                                    className="stroke-current fill-current w-5 h-5 mr-3"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                >
                                    <defs />
                                    <rect
                                        width={176}
                                        height={176}
                                        x={48}
                                        y={48}
                                        fill="none"
                                        className="stroke-current"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={32}
                                        rx={20}
                                        ry={20}
                                    />
                                    <rect
                                        width={176}
                                        height={176}
                                        x={288}
                                        y={48}
                                        fill="none"
                                        className="stroke-current"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={32}
                                        rx={20}
                                        ry={20}
                                    />
                                    <rect
                                        width={176}
                                        height={176}
                                        x={48}
                                        y={288}
                                        fill="none"
                                        className="stroke-current"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={32}
                                        rx={20}
                                        ry={20}
                                    />
                                    <rect
                                        width={176}
                                        height={176}
                                        x={288}
                                        y={288}
                                        fill="none"
                                        className="stroke-current"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={32}
                                        rx={20}
                                        ry={20}
                                    />
                                </svg>
                                <Text>resources</Text>
                            </span>

                            <div className="flex flex-col pl-8">
                                {this.props.resources.map((resource) => (
                                    <Link
                                        key={resource.collection}
                                        to={`/resources/${resource.collection}`}
                                        className="hover:opacity-75 transition duration-100 mt-4 inline-block"
                                    >
                                        <Text>{resource.label}</Text>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{ marginLeft: '14rem' }}
                        className="w-full flex-1 bg-gray-lightest"
                    >
                        <div className="w-full h-12 bg-white z-10 shadow fixed flex justify-between items-center">
                            <div className="w-1/3"></div>
                            <div className="w-1/3"></div>
                            <div className="w-1/3">
                                
                            </div>
                        </div>
                        <div className="py-4 px-3 pt-16 pb-12 md:px-12">
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
                                <Text variant="small">
                                    © Flamingo Admin {new Date().getFullYear()}
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withResources(mustBeAuthenticated(DashboardPage))

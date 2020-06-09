import React from 'react'
import { Link, Route } from 'react-router-dom'
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox'

import ResourceIndex from '../ResourceIndex'

import { withResources } from '../../store/resources'
import { mustBeAuthenticated } from '../../store/auth'

class DashboardPage extends React.Component {
    render() {
        return (
            <div className="w-full">
                <div className="w-full h-12 flex items-center bg-dark-secondary">
                    <div className="w-1/3 px-6 text-white text-sm">
                        Flamingo
                    </div>
                    <div className="w-1/3 flex">
                        <SearchBox
                            className="w-full"
                            placeholder="Search resources and data"
                        />
                    </div>
                    <div className="flex pr-5 justify-end w-1/3"></div>
                </div>
                <div
                    style={{ height: 'calc(100vh - 3rem)' }}
                    className="flex flex-wrap h-screen"
                >
                    <div className="w-full md:w-1/7 bg-dark-primary h-full py-5 px-6">
                        <span className="flex items-center text-white text-sm uppercase opacity-75">
                            <svg
                                className="stroke-current fill-current text-white w-5 h-5 mr-3"
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
                            resources
                        </span>

                        <div className="flex flex-col pl-8">
                            {this.props.resources.map((resource) => (
                                <Link
                                    key={resource.collection}
                                    to={`/resources/${resource.collection}`}
                                    className="text-white hover:opacity-75 transition duration-100 mt-4 inline-block"
                                >
                                    {resource.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-6/7 h-full">
                        <div className="py-4 px-3 md:py-10 md:px-12">
                            <Route
                                path="/resources/:resource"
                                component={ResourceIndex}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withResources(mustBeAuthenticated(DashboardPage))

import React from 'react'
import { useParams, Redirect } from 'react-router-dom'

import Verb from './HttpVerb'
import NavList from './NavList'
import OnThisPage from './OnThisPage'

import { RouteGroup } from './types'

interface PageProps {
    routeGroups: RouteGroup
}

const Page: React.FC<PageProps> = ({ routeGroups }) => {
    const { group: groupSlug } = useParams<{
        group: string
    }>()

    const currentGroupKey = Object.keys(routeGroups).find(
        routeGroupKey => routeGroups[routeGroupKey].slug === groupSlug
    )

    const group = routeGroups[currentGroupKey]

    if (!group) {
        const firstGroup = routeGroups[Object.keys(routeGroups)[0]].slug

        return <Redirect to={`/rest-docs/${firstGroup}`} />
    }

    return (
        <>
            <aside className="w-full lg:w-1/5 lg:block fixed lg:relative inset-0 mt-16 lg:mt-0 z-30 bg-white dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent hidden h-screen-16">
                <div className="lg:sticky lg:top-16 overflow-y-auto h-full lg:h-auto lg:max-h-(screen-16)">
                    <ul className="p-4 lg:py-8 lg:pl-0 lg:pr-8">
                        <li className="mb-4 active">
                            <p className="mb-2 text-tensei-gray-500 uppercase tracking-wider font-bold text-sm lg:text-sm">
                                Routes
                            </p>
                            <ul className="">
                                <NavList routesGroup={routeGroups} />
                            </ul>
                        </li>
                    </ul>
                </div>
            </aside>
            <div className="flex flex-wrap-reverse w-full lg:w-4/5">
                <div className="w-full py-4 lg:pt-8 lg:pb-4 dark:border-gray-800 lg:w-3/4 lg:border-l lg:border-r">
                    <article className="prose max-w-none lg:px-8">
                        <h1 className="flex items-center justify-between">
                            {group.name}
                        </h1>
                        <div>
                            {group.routes.map(route => {
                                return (
                                    <article
                                        key={route.id}
                                        id={route.paramCaseName}
                                    >
                                        <h2>{route.name}</h2>

                                        <pre className="flex items-center px-5">
                                            <Verb verb={route.type} />
                                            <code>{route.path}</code>
                                        </pre>
                                        {route.description ? (
                                            <p className="mb-5">
                                                {route.description}
                                            </p>
                                        ) : null}

                                        {route.parameters.length > 0 ? (
                                            <div className="overflow-y-auto scrollbar-w-2 scrollbar-track-gray-lighter scrollbar-thumb-rounded scrollbar-thumb-gray scrolling-touch lg:max-h-sm">
                                                <h5 className="font-bold mb-5">
                                                    Route Parameters
                                                </h5>

                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr>
                                                            <th className="z-20 sticky top-0 text-sm font-semibold text-gray-600 bg-white p-0">
                                                                <div className="pb-2 pr-2">
                                                                    Name
                                                                </div>
                                                            </th>
                                                            <th className="z-20 sticky top-0 text-sm font-semibold text-gray-600 bg-white p-0">
                                                                <div className="pb-2 pr-2">
                                                                    Type
                                                                </div>
                                                            </th>
                                                            <th className="z-20 sticky top-0 text-sm font-semibold text-gray-600 bg-white p-0">
                                                                <div className="pb-2 pr-2">
                                                                    In
                                                                </div>
                                                            </th>
                                                            <th className="z-20 sticky top-0 text-sm font-semibold text-gray-600 bg-white p-0">
                                                                <div className="pb-2 pr-2">
                                                                    Validations
                                                                </div>
                                                            </th>
                                                            <th className="z-20 sticky top-0 text-sm font-semibold text-gray-600 bg-white p-0">
                                                                <div className="pb-2 pr-2">
                                                                    Description
                                                                </div>
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {route.parameters.map(
                                                            parameter => (
                                                                <tr
                                                                    key={
                                                                        parameter.name
                                                                    }
                                                                >
                                                                    <td className="py-2 pr-2 font-mono text-sm whitespace-nowrap border-t border-gray-200">
                                                                        {
                                                                            parameter.name
                                                                        }
                                                                    </td>
                                                                    <td className="py-2 pr-2 font-mono text-xs whitespace-nowrap border-t border-gray-200">
                                                                        <code>
                                                                            {
                                                                                parameter.type
                                                                            }
                                                                        </code>
                                                                    </td>
                                                                    <td className="py-2 pr-2 font-mono text-xs whitespace-nowrap border-t border-gray-200">
                                                                        {
                                                                            parameter.in
                                                                        }
                                                                    </td>
                                                                    {parameter.validation ? (
                                                                        <td className="py-2 pr-2 font-mono text-xs whitespace-nowrap border-t border-gray-200">
                                                                            {parameter.validation?.join(
                                                                                '|'
                                                                            )}
                                                                        </td>
                                                                    ) : null}
                                                                    <td className="py-2 pr-2 font-mono text-xs whitespace-nowrap border-t border-gray-200">
                                                                        {
                                                                            parameter.description
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : null}

                                        {route.sampleRequest ? (
                                            <h5 className="font-bold mb-5">
                                                Sample request
                                            </h5>
                                        ) : null}

                                        {route.sampleRequest ? (
                                            <pre>
                                                <code>
                                                    {route.sampleRequest}
                                                </code>
                                            </pre>
                                        ) : null}
                                    </article>
                                )
                            })}
                        </div>
                    </article>
                </div>

                <div className="w-full lg:w-1/4 block relative">
                    <div className="lg:sticky lg:top-16 overflow-y-auto h-full lg:h-auto lg:max-h-(screen-16)">
                        <nav className="py-4 lg:py-8 lg:pl-8 lg:pr-2">
                            <p className="mb-3 lg:mb-2 text-tensei-gray-700 uppercase tracking-wider font-bold text-sm lg:text-sm">
                                On this page
                            </p>

                            {group ? <OnThisPage routeGroup={group} /> : null}
                        </nav>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page

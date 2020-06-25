import cn from 'classnames'
import React, { Fragment } from 'react'
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
    renderOld() {
        return (
            <div className="w-full">
                <div className="flex flex-wrap min-h-screen h-screen relative">
                    <div className="w-full md:w-56 h-full md:fixed overflow-scroll text-white bg-blue-darkest">
                        <div className="flex items-center px-6 w-full h-12 bg-blue-primary">
                            <Text variant="large" className="font-bold">
                                Flamingo
                            </Text>
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
                            <div className="w-1/3"></div>
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

    render() {
        return (
            <Fragment>
                <div>
                    <aside className="navbar navbar-vertical navbar-expand-lg navbar-dark">
                        <div className="container">
                            <button
                                className="navbar-toggler"
                                type="button"
                                data-toggle="collapse"
                                data-target="#navbar-menu"
                            >
                                <span className="navbar-toggler-icon" />
                            </button>
                            <a
                                href="."
                                className="navbar-brand navbar-brand-autodark"
                            >
                                {/* <img
                                    src="./static/logo-white.svg"
                                    alt="Tabler"
                                    className="navbar-brand-image"
                                /> */}
                                Flamingo
                            </a>
                            <div className="navbar-nav flex-row d-lg-none">
                                <div className="nav-item dropdown d-none d-md-flex mr-3">
                                    <a
                                        href="#"
                                        className="nav-link px-0"
                                        data-toggle="dropdown"
                                        tabIndex={-1}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="icon"
                                            width={24}
                                            height={24}
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path
                                                stroke="none"
                                                d="M0 0h24v24H0z"
                                            />
                                            <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                                            <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                                        </svg>
                                        <span className="badge bg-red" />
                                    </a>
                                    <div className="dropdown-menu dropdown-menu-right dropdown-menu-card">
                                        <div className="card">
                                            <div className="card-body">
                                                Lorem ipsum dolor sit amet,
                                                consectetur adipisicing elit.
                                                Accusamus ad amet consectetur
                                                exercitationem fugiat in ipsa
                                                ipsum, natus odio quidem quod
                                                repudiandae sapiente. Amet
                                                debitis et magni maxime
                                                necessitatibus ullam.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="nav-item dropdown">
                                    <a
                                        href="#"
                                        className="nav-link d-flex lh-1 text-reset p-0"
                                        data-toggle="dropdown"
                                    >
                                        <span
                                            className="avatar"
                                            style={{
                                                backgroundImage:
                                                    'url(./static/avatars/000m.jpg)',
                                            }}
                                        />
                                        <div className="d-none d-xl-block pl-2">
                                            <div>Paweł Kuna</div>
                                            <div className="mt-1 small text-muted">
                                                UI Designer
                                            </div>
                                        </div>
                                    </a>
                                    <div className="dropdown-menu dropdown-menu-right">
                                        <a className="dropdown-item" href="#">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="icon dropdown-item-icon"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path
                                                    stroke="none"
                                                    d="M0 0h24v24H0z"
                                                />
                                                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <circle cx={12} cy={12} r={3} />
                                            </svg>
                                            Action
                                        </a>
                                        <a className="dropdown-item" href="#">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="icon dropdown-item-icon"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path
                                                    stroke="none"
                                                    d="M0 0h24v24H0z"
                                                />
                                                <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
                                                <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
                                                <line
                                                    x1={16}
                                                    y1={5}
                                                    x2={19}
                                                    y2={8}
                                                />
                                            </svg>
                                            Another action
                                        </a>
                                        <div className="dropdown-divider" />
                                        <a className="dropdown-item" href="#">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="icon dropdown-item-icon"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path
                                                    stroke="none"
                                                    d="M0 0h24v24H0z"
                                                />
                                                <line
                                                    x1={12}
                                                    y1={5}
                                                    x2={12}
                                                    y2={19}
                                                />
                                                <line
                                                    x1={5}
                                                    y1={12}
                                                    x2={19}
                                                    y2={12}
                                                />
                                            </svg>
                                            Separated link
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="collapse navbar-collapse"
                                id="navbar-menu"
                            >
                                <ul className="navbar-nav pt-lg-3">
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/">
                                            <span className="nav-link-icon d-md-none d-lg-inline-block">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="icon"
                                                    width={24}
                                                    height={24}
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path
                                                        stroke="none"
                                                        d="M0 0h24v24H0z"
                                                    />
                                                    <polyline points="5 12 3 12 12 3 21 12 19 12" />
                                                    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
                                                    <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
                                                </svg>
                                            </span>
                                            <span className="nav-link-title">
                                                Dashboard
                                            </span>
                                        </Link>
                                    </li>
                                    <li className="nav-item dropdown">
                                        <a
                                            className="nav-link"
                                            href="#navbar-layout"
                                            data-toggle="dropdown"
                                            role="button"
                                            aria-expanded="true"
                                        >
                                            <span className="nav-link-icon d-md-none d-lg-inline-block">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="icon"
                                                    width={24}
                                                    height={24}
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path
                                                        stroke="none"
                                                        d="M0 0h24v24H0z"
                                                    />
                                                    <rect
                                                        x={4}
                                                        y={4}
                                                        width={6}
                                                        height={5}
                                                        rx={2}
                                                    />
                                                    <rect
                                                        x={4}
                                                        y={13}
                                                        width={6}
                                                        height={7}
                                                        rx={2}
                                                    />
                                                    <rect
                                                        x={14}
                                                        y={4}
                                                        width={6}
                                                        height={7}
                                                        rx={2}
                                                    />
                                                    <rect
                                                        x={14}
                                                        y={15}
                                                        width={6}
                                                        height={5}
                                                        rx={2}
                                                    />
                                                </svg>
                                            </span>
                                            <span className="nav-link-title">
                                                Resources
                                            </span>
                                        </a>
                                        <ul className="dropdown-menu show">
                                            {this.props.resources.map(
                                                (resource) => {
                                                    return (
                                                        <li
                                                            key={
                                                                resource.collection
                                                            }
                                                        >
                                                            <Link
                                                                to={`/resources/${resource.collection}`}
                                                                className={cn(
                                                                    'dropdown-item',
                                                                    {
                                                                        active:
                                                                            this
                                                                                .props
                                                                                .location
                                                                                .pathname ===
                                                                            `/resources/${resource.collection}`,
                                                                    }
                                                                )}
                                                            >
                                                                <Text>
                                                                    {
                                                                        resource.label
                                                                    }
                                                                </Text>
                                                            </Link>
                                                        </li>
                                                    )
                                                }
                                            )}
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                    <div className="page">
                        <header className="navbar navbar-expand-md navbar-light d-none d-lg-flex">
                            <div className="container-xl">
                                <button
                                    className="navbar-toggler"
                                    type="button"
                                    data-toggle="collapse"
                                    data-target="#navbar-menu"
                                >
                                    <span className="navbar-toggler-icon" />
                                </button>
                                <div className="navbar-nav flex-row order-md-last">
                                    <div className="nav-item dropdown d-none d-md-flex mr-3">
                                        <a
                                            href="#"
                                            className="nav-link px-0"
                                            data-toggle="dropdown"
                                            tabIndex={-1}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="icon"
                                                width={24}
                                                height={24}
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path
                                                    stroke="none"
                                                    d="M0 0h24v24H0z"
                                                />
                                                <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                                                <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                                            </svg>
                                            <span className="badge bg-red" />
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-right dropdown-menu-card">
                                            <div className="card">
                                                <div className="card-body">
                                                    Lorem ipsum dolor sit amet,
                                                    consectetur adipisicing
                                                    elit. Accusamus ad amet
                                                    consectetur exercitationem
                                                    fugiat in ipsa ipsum, natus
                                                    odio quidem quod repudiandae
                                                    sapiente. Amet debitis et
                                                    magni maxime necessitatibus
                                                    ullam.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="nav-item dropdown">
                                        <a
                                            href="#"
                                            className="nav-link d-flex lh-1 text-reset p-0"
                                            data-toggle="dropdown"
                                        >
                                            <span
                                                className="avatar"
                                                style={{
                                                    backgroundImage:
                                                        'url(./static/avatars/000m.jpg)',
                                                }}
                                            />
                                            <div className="d-none d-xl-block pl-2">
                                                <div>Paweł Kuna</div>
                                                <div className="mt-1 small text-muted">
                                                    UI Designer
                                                </div>
                                            </div>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <a
                                                className="dropdown-item"
                                                href="#"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="icon dropdown-item-icon"
                                                    width={24}
                                                    height={24}
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path
                                                        stroke="none"
                                                        d="M0 0h24v24H0z"
                                                    />
                                                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <circle
                                                        cx={12}
                                                        cy={12}
                                                        r={3}
                                                    />
                                                </svg>
                                                Action
                                            </a>
                                            <a
                                                className="dropdown-item"
                                                href="#"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="icon dropdown-item-icon"
                                                    width={24}
                                                    height={24}
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path
                                                        stroke="none"
                                                        d="M0 0h24v24H0z"
                                                    />
                                                    <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
                                                    <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
                                                    <line
                                                        x1={16}
                                                        y1={5}
                                                        x2={19}
                                                        y2={8}
                                                    />
                                                </svg>
                                                Another action
                                            </a>
                                            <div className="dropdown-divider" />
                                            <a
                                                className="dropdown-item"
                                                href="#"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="icon dropdown-item-icon"
                                                    width={24}
                                                    height={24}
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path
                                                        stroke="none"
                                                        d="M0 0h24v24H0z"
                                                    />
                                                    <line
                                                        x1={12}
                                                        y1={5}
                                                        x2={12}
                                                        y2={19}
                                                    />
                                                    <line
                                                        x1={5}
                                                        y1={12}
                                                        x2={19}
                                                        y2={12}
                                                    />
                                                </svg>
                                                Separated link
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="collapse navbar-collapse"
                                    id="navbar-menu"
                                >
                                    <div>
                                        <form action="." method="get">
                                            <div className="input-icon">
                                                <span className="input-icon-addon">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="icon"
                                                        width={24}
                                                        height={24}
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path
                                                            stroke="none"
                                                            d="M0 0h24v24H0z"
                                                        />
                                                        <circle
                                                            cx={10}
                                                            cy={10}
                                                            r={7}
                                                        />
                                                        <line
                                                            x1={21}
                                                            y1={21}
                                                            x2={15}
                                                            y2={15}
                                                        />
                                                    </svg>
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search…"
                                                />
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </header>
                        <div className="content">
                            <div className="container-xl">
                                <Route
                                    exact
                                    path="/resources/:resource"
                                    component={ResourceIndex}
                                />
                                <Route
                                    path="/resources/:resource/new"
                                    component={CreateResource}
                                />
                            </div>
                            <footer className="footer footer-transparent">
                                <div className="container">
                                    <div className="row text-center align-items-center justify-content-center">
                                        <div className="col-12 col-lg-auto mt-3 mt-lg-0">
                                            Copyright ©{' '}
                                            {new Date().getFullYear()}
                                            <a
                                                href="https://tryflamingo.io"
                                                className="link-secondary ml-2"
                                                target="_blank"
                                            >
                                                Flamingo Admin.
                                            </a>
                                            <span className="ml-1">
                                                All rights reserved.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </footer>
                        </div>
                    </div>
                </div>
            </Fragment>
        )
    }
}

export default withResources(mustBeAuthenticated(DashboardPage))

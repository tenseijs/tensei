import cx from 'classnames'
import Gravatar from 'react-gravatar'
import React, { useState } from 'react'
import { Route, Switch, Link, useLocation } from 'react-router-dom'

import FourOhFour from './404'
import Settings from './Settings'
import ResourceIndex from './ResourceIndex'
import ResourceDetail from './ResourceDetail'
import CreateResource from './CreateResource'
import { ContentRoot } from './Content/Root'

export interface DashboardProps {}

const firstResource = window.Tensei.state.resources[0]

const sidebarItems = [
  {
    path: 'dashboards',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  {
    path: `content/${firstResource.slug}`,
    matchActivePath: 'content',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    )
  },
  {
    path: 'assets',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    )
  }
]

const Dashboard: React.FC<DashboardProps> = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname.includes(path)

  return (
    <>
      <div className="h-screen flex overflow-hidden">
        {/* Static sidebar for desktop */}

        <div className="bg-tensei-darkest flex flex-shrink-0">
          <div className="flex flex-col items-center w-16">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex flex-col items-center flex-1 flex-grow mt-3">
              <div
                className="flex flex-col items-center justify-center border-2 border-white rounded-lg"
                style={{ width: '44px', height: '44px' }}
              >
                <img
                  src="https://res.cloudinary.com/bahdcoder/image/upload/v1630016927/Asset_5_4x_hykfhh.png"
                  alt="logo"
                  className="w-10 h-10"
                />
              </div>

              <div className="mt-10"></div>

              {sidebarItems.map(item => {
                const active = isActive(item.matchActivePath || item.path)

                return (
                  <Link
                    key={item.path}
                    to={window.Tensei.getPath(item.path)}
                    className={cx(
                      'flex items-center justify-center h-8 w-8 mb-4 rounded',
                      {
                        'bg-tensei-primary bg-opacity-50 text-white': isActive(
                          item.path
                        ),
                        'text-tensei-gray-450': !active
                      }
                    )}
                  >
                    {item.icon}
                  </Link>
                )
              })}
            </div>
            <div className="flex-shrink-0 mb-5">
              <a
                target="_blank"
                href="https://docs.tenseijs.com"
                className="mb-4 flex items-center justify-center h-8 w-8 rounded text-tensei-gray-450 hover:text-white hover:bg-tensei-primary hover:bg-opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href=""
                className="mb-4 flex items-center justify-center h-8 w-8 rounded text-tensei-gray-450 hover:text-white hover:bg-tensei-primary hover:bg-opacity-50
              "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </a>
              <Gravatar
                className="h-8 w-8 rounded-full"
                email={window.Tensei.state.admin.email}
              />
            </div>
          </div>
        </div>
        <div className="flex w-0 flex-1 overflow-hidden">
          <Switch>
            <Route
              component={ContentRoot}
              path={window.Tensei.getPath('content')}
            />
            <Route
              exact
              component={CreateResource}
              path={window.Tensei.getPath('resources/:resource/create')}
            />
            <Route
              exact
              component={CreateResource}
              path={window.Tensei.getPath('resources/:resource/:id/update')}
            />
            <Route
              exact
              component={ResourceDetail}
              path={window.Tensei.getPath('resources/:resource/:id')}
            />

            <Route
              component={Settings}
              path={window.Tensei.getPath('settings')}
            />

            <Route component={FourOhFour} path={window.Tensei.getPath('404')} />
            {window.Tensei.ctx.routes.map(route => (
              <Route
                key={route.path}
                path={route.path}
                exact={route.exact}
                component={route.component}
              />
            ))}
            <Route component={FourOhFour} />
          </Switch>
        </div>
      </div>
    </>
  )
}

export default Dashboard

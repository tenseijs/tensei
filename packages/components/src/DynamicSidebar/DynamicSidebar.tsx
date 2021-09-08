import cx from 'classnames'
import React, { FunctionComponent, useState } from 'react'

export interface DynamicSidebarProps {
  title?: string
}

const DynamicSidebarLink: FunctionComponent<{
  as?: any
  to?: string
  href?: string
  active?: boolean
}> = ({ to, as, children, href, active }) => {
  const Component = as || 'a'
  return (
    <Component
      href={href}
      to={to}
      className={cx('cursor-pointer px-3 py-1 text-sm mb-1', {
        'rounded bg-opacity-15 text-tensei-primary bg-tensei-primary font-medium': active,
        'hover:bg-tensei-primary hover:bg-opacity-15 hover:text-tensei-primary hover:font-medium': !active
      })}
    >
      {children}
    </Component>
  )
}

const DynamicSidebarGroup: FunctionComponent<{
  title?: string
}> = ({ title, children }) => {
  const [open, setOpen] = useState(true)

  return (
    <div
      className={cx({
        'my-4': true
      })}
    >
      <button
        onClick={() => setOpen(!open)}
        className="text-tensei-darkest text-xs uppercase font-medium flex items-center tracking-wider"
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={cx(
            'h-4 text-tensei-darkest ml-3 w-4',
            !open && 'transform -rotate-90'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open ? (
        <div className="my-4">
          <nav className="flex flex-col">{children}</nav>
        </div>
      ) : null}
    </div>
  )
}

export const DynamicSidebar: FunctionComponent<DynamicSidebarProps> & {
  DynamicSidebarLink: typeof DynamicSidebarLink
  DynamicSidebarGroup: typeof DynamicSidebarGroup
} = ({ title, children }) => {
  return (
    <div className="flex flex-col px-6 py-5 w-64 bg-tensei-gray-100 border-r border-tensei-gray-600">
      {title ? (
        <h2 className="font-bold text-xl text-tensei-darkest">{title}</h2>
      ) : null}

      <div className="mt-5">{children}</div>
    </div>
  )
}

DynamicSidebar.DynamicSidebarLink = DynamicSidebarLink
DynamicSidebar.DynamicSidebarGroup = DynamicSidebarGroup

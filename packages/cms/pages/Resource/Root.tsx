import React, { FunctionComponent } from 'react'
import { PageWrapper, ActionButton, Button, Heading } from '@tensei/components'

export interface ContentRootProps {}

export const ContentRoot: FunctionComponent<ContentRootProps> = () => {
  return (
    <PageWrapper
      renderTopBarContent={() => (
        <>
          <div className="flex-1 flex items-center">
            <h2 className="text-tensei-darkest font-bold">Products</h2>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            <div className="mr-3">
              <ActionButton
                actions={[
                  {
                    title: 'Save as PDF',
                    onClick: console.log
                  }
                ]}
              >
                Actions
              </ActionButton>
            </div>
            <Button primary>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create item
            </Button>
          </div>
        </>
      )}
    >
      Showing the current resource products
    </PageWrapper>
  )
}

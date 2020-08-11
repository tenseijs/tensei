import React from 'react'
import { render } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { MemoryRouter } from 'react-router-dom'

import Auth from '~/store/auth'
import Resources from '~/store/resources'
import { resources, user } from './data'

const history = createMemoryHistory()

const setupPage = (
    initialEntries,
    initialIndex,
    Component,
    withAuth = true
) => {
    const props = { resources }
    return render(
        <MemoryRouter
            initialIndex={initialIndex}
            initialEntries={initialEntries}
        >
            <Auth.Provider value={withAuth ? [user, () => jest.fn()] : []}>
                <Resources.Provider
                    value={{
                        resources: resources,
                    }}
                >
                    <Component {...props} location={history.location} />
                </Resources.Provider>
            </Auth.Provider>
        </MemoryRouter>
    )
}
export default setupPage

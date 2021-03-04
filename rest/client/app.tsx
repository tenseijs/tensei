import React from 'react'
import { Tensei, PageWrapper } from '@tensei/components'

declare var Tensei: Tensei

const Rest = () => {
    return (
        <PageWrapper>
            {`Hello rest`}
        </PageWrapper>
    )
}

Tensei.register(({ route }) => {
    route({
        path: 'rest',
        name: 'Rest',
        icon: 'cog',
        component: Rest,
        requiredPermissions: []
    })
})

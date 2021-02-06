---
to: <%= h.changeCase.param(name) %>/client/app.tsx
---

import React from 'react'
import { Tensei, PageWrapper } from '@tensei/components'

declare var Tensei: Tensei

const <%= h.changeCase.pascal(name) %> = () => {
    return (
        <PageWrapper>
            {`Hello <%= h.changeCase.param(name) %>`}
        </PageWrapper>
    )
}

Tensei.register(({ route }) => {
    route({
        path: '<%= h.changeCase.param(name) %>',
        name: '<%= h.changeCase.pascal(name) %>',
        icon: 'cog',
        component: <%= h.changeCase.pascal(name) %>,
        requiredPermissions: []
    })
})

import React from 'react'

import { Route } from './types'

interface HttpVerbProps {
    verb: Route['type']
}

const HttpVerb: React.FC<HttpVerbProps> = ({ verb }) => {
    const classes = {
        GET: 'bg-tensei-secondary',
        POST: 'bg-tensei-success',
        PUT: '',
        PATCH: '',
        DELETE: 'bg-tensei-error'
    }
    return (
        <div
            className={`mr-4 px-4 flex items-center justify-center rounded-sm text-white font-bold ${classes[verb]}`}
        >
            {verb}
        </div>
    )
}

export default HttpVerb

import * as React from 'react'
import * as DOM from 'react-dom'

import { Sdk } from '../client/src/rest'

const tensei = new Sdk()

const App: React.FunctionComponent<{}> = () => {
    const load = async () => {
        await tensei.auth.login({
            object: {
                email: 'bahdcoder+money@gmail.com',
                password: 'password',
                // accepted_terms_and_conditions: false,
                // categories: []
            }
        })
    }

    return (
        <>
        <button onClick={load}>Make request right now</button>
        </
        >
    )
}

DOM.render(<App />, document.querySelector('#app'))

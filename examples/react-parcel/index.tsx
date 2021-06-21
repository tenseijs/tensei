import * as React from 'react'
import * as DOM from 'react-dom'

import { Sdk } from '@tensei/sdk'

const sdk = new Sdk()

const tensei = sdk

const App: React.FunctionComponent<{}> = () => {
    const load = async () => {
        await tensei.auth().login({
            object: {
                email: 'bahdcoder+frantz@gmail.com',
                password: 'password',
                accepted_terms_and_conditions: true
            }
        })
    }

    const fetchCategories = async () => {
        await tensei.categories().findMany({
            pagination: {
                page: 1,
                per_page: 25
            }
        })
    }

    React.useEffect(() => {
        tensei.auth().socialConfirm()
    }, [])

    return (
        <>
        <button onClick={load}>Make request right now</button>
        <br />
        <button onClick={fetchCategories}>Make authenticated request</button>
        <br />
        <a href={tensei.auth().socialRedirectUrl('google')}>Login with google</a>
        </
        >
    )
}

DOM.render(<App />, document.querySelector('#app'))

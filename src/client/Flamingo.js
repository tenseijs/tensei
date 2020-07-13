import Axios from 'axios'
import { Notification } from '@contentful/forma-36-react-components'

import TextField from './fields/Text'
import DateField from './fields/Date'
import HasManyField from './fields/HasMany'
import LinkField from './index-fields/Link'
import DateIndexField from './index-fields/Date'

import TextIndexField from './index-fields/Text'

class Flamingo {
    state = (() => {
        let user = null
        let resources = []

        try {
            user = JSON.parse(window.flamingoDefaultState.user)
            resources = JSON.parse(window.flamingoDefaultState.resources)
        } catch (errors) {}

        return {
            user,
            resources,
        }
    })()

    library = {
        Notification
    }

    request = Axios.create({
        baseURL: '/api/',
    })

    fieldComponents = {
        DateField,
        TextField,
        HasManyField,
        LinkField: TextField,
        NumberField: TextField,
    }

    indexFieldComponents = {
        TextField: TextIndexField,
        IDField: TextIndexField,
        NumberField: TextField,
        LinkField,
        DateField: DateIndexField,
    }
}

window.Flamingo = new Flamingo()

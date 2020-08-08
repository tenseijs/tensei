import Axios from 'axios'
import { Notification } from '@contentful/forma-36-react-components'

import TextField from './fields/Text'
import SelectField from './fields/Select'
import HasManyField from './fields/HasMany'
import LinkField from './index-fields/Link'
import DateTimeField from './fields/DateTime'
import TextareaField from './fields/Textarea'
import BelongsToField from './fields/BelongsTo'
import DateIndexField from './index-fields/Date'

import TextIndexField from './index-fields/Text'

class Flamingo {
    state = (() => {
        let user = null
        let resources = []
        let appConfig = {}
        let shouldShowRegistrationScreen = false

        try {
            appConfig = JSON.parse(window.flamingoDefaultState.appConfig)
            resources = JSON.parse(window.flamingoDefaultState.resources)
            shouldShowRegistrationScreen =
                window.flamingoDefaultState.shouldShowRegistrationScreen ===
                'true'

            user = JSON.parse(window.flamingoDefaultState.user || null)
        } catch (errors) {}

        return {
            user,
            resources,
            appConfig,
            shouldShowRegistrationScreen,
        }
    })()

    library = {
        Notification,
    }

    getPath = (path) => {
        return `/${this.state.appConfig.dashboardPath}/${path}`
    }

    request = Axios.create({
        baseURL: '/api/',
    })

    fieldComponents = {
        TextField,
        SelectField,
        HasManyField,
        DateTimeField,
        TextareaField,
        BelongsToField,
        LinkField: TextField,
        NumberField: TextField,
        IntegerField: TextField,
        DateField: DateTimeField,
    }

    indexFieldComponents = {
        LinkField,
        TextField: TextIndexField,
        IDField: TextIndexField,
        NumberField: TextField,
        DateField: DateIndexField,
    }
}

window.Flamingo = new Flamingo()

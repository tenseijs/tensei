import Axios from 'axios'
import { Notification } from '@contentful/forma-36-react-components'

import TextField from './fields/Text'
import SelectField from './fields/Select'
import BooleanField from './fields/Boolean'
import HasManyField from './fields/HasMany'
import LinkField from './index-fields/Link'
import DateTimeField from './fields/DateTime'
import TextareaField from './fields/Textarea'
import BelongsToField from './fields/BelongsTo'
import DateIndexField from './index-fields/Date'
import BooleanIndexField from './index-fields/Boolean'
import BelongsToManyField from './fields/BelongsToMany'
import HasManyDetailField from './detail-fields/HasManyField'
import TextareaDetailField from './detail-fields/TextareaField'
import BelongsToDetailField from './detail-fields/BelongsToField'
import BelongsToManyDetailField from './detail-fields/BelongsToManyField'

import TextIndexField from './index-fields/Text'

class Tensei {
    state = (() => {
        let user = null
        let resources = []
        let appConfig = {}
        let permissions = {}
        let shouldShowRegistrationScreen = false

        try {
            appConfig = JSON.parse(window.tenseiDefaultState.appConfig)
            resources = JSON.parse(window.tenseiDefaultState.resources)
            shouldShowRegistrationScreen =
                window.tenseiDefaultState.shouldShowRegistrationScreen ===
                'true'

            user = JSON.parse(window.tenseiDefaultState.user || null)

            user.permissions.forEach((permission) => {
                permissions[permission] = true
            })
        } catch (errors) {}

        return {
            user,
            resources,
            appConfig,
            permissions,
            shouldShowRegistrationScreen,
        }
    })()

    library = {
        Notification,
    }

    setWrapperState = () => {}

    getPath = (path) => `/${this.state.appConfig.dashboardPath}/${path}`

    request = Axios.create({
        baseURL: '/api/',
    })

    bootingCallbacks = []

    fieldComponents = {
        TextField,
        SelectField,
        BooleanField,
        HasManyField,
        DateTimeField,
        TextareaField,
        BelongsToField,
        BelongsToManyField,
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
        DateTimeField: DateIndexField,
        BooleanField: BooleanIndexField,
    }

    detailFieldComponents = {
        LinkField,
        IDField: TextIndexField,
        TextField: TextIndexField,
        DateField: DateIndexField,
        SelectField: TextIndexField,
        NumberField: TextIndexField,
        IntegerField: TextIndexField,
        DateTimeField: DateIndexField,
        BooleanField: BooleanIndexField,
        HasManyField: HasManyDetailField,
        TextareaField: TextareaDetailField,
        BelongsToField: BelongsToDetailField,
        BelongsToManyField: BelongsToManyDetailField,
    }

    booting = (boot) => {
        this.bootingCallbacks = [...this.bootingCallbacks, boot.bind(this)]

        return this
    }

    field = (key, Component) => {
        this.fieldComponents = {
            ...this.fieldComponents,
            [key]: Component,
        }

        return this
    }

    detailField = (key, Component) => {
        this.detailFieldComponents = {
            ...this.detailFieldComponents,
            [key]: Component,
        }

        return this
    }

    indexField = (key, Component) => {
        this.indexFieldComponents = {
            ...this.indexFieldComponents,
            [key]: Component,
        }

        return this
    }

    boot = () => {
        this.bootingCallbacks.forEach((bootCallback) => {
            bootCallback()
        })

        this.setWrapperState({
            booted: true,
        })
    }
}

window.Tensei = new Tensei()

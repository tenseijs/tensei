import Axios from 'axios'
import {
    TextInput,
    Textarea,
    TenseiState,
    DatePicker,
    Select,
    Checkbox,
    Tensei,
    Paragraph,
    ResourceContract,
    TenseiRegisterFunction,
    TenseiCtxInterface
} from '@tensei/components'

import ID from './detail/ID'
import Text from './detail/Text'
import Date from './detail/Date'
import IDIndex from './index/ID'
import BooleanDetail from './detail/Boolean'
import TextareaDetail from './detail/Textarea'

class Core {
    state = (() => {
        let config = {}
        let admin = null
        let resources = []
        let permissions: {
            [key: string]: boolean
        } = {}
        let resourcesMap: {
            [key: string]: ResourceContract
        } = {}
        let registered = false

        const { ___tensei___ } = window

        try {
            config = JSON.parse(___tensei___.ctx)
            resources = JSON.parse(___tensei___.resources)
            registered = ___tensei___.shouldShowRegistrationScreen === 'false'

            resources.forEach((resource: any) => {
                resourcesMap[resource.slug] = resource
            })

            admin = JSON.parse(___tensei___.admin || '')

            admin.admin_permissions.forEach((permission: string) => {
                permissions[permission] = true
            })
        } catch (errors) {}

        return {
            admin,
            config,
            resources,
            permissions,
            registered,
            resourcesMap
        } as TenseiState
    })()

    private hooks: TenseiRegisterFunction[] = []

    components: Tensei['components'] = {
        form: {
            Select,
            Textarea,
            Checkbox,
            Text: TextInput,
            Date: DatePicker
        },
        index: {
            ID: IDIndex,
            Text,
            Date,
            DateTime: Date,
            Timestamp: Date
        },
        detail: {
            ID,
            Text,
            Date,
            DateTime: Date,
            Timestamp: Date,
            Boolean: BooleanDetail,
            Textarea: TextareaDetail
        }
    }

    ctx: TenseiCtxInterface = {} as any

    client = Axios.create({
        baseURL: this.state.config.apiPath,
        xsrfCookieName: 'x-csrf-token'
    })

    getPath = (path: string) => `/${this.state.config.dashboardPath}/${path}`

    register = (fn: TenseiRegisterFunction) => {
        this.hooks.push(fn)
    }

    formComponent = (name: string, Component: React.FC<any>) => {
        this.components.form[name] = Component
    }

    detailComponent = (name: string, Component: React.FC<any>) => {
        this.components.detail[name] = Component
    }

    indexComponent = (name: string, Component: React.FC<any>) => {
        this.components.index[name] = Component
    }

    boot = () => {
        this.hooks.forEach(hook => {
            hook({
                formComponent: this.formComponent,
                indexComponent: this.indexComponent,
                detailComponent: this.detailComponent
            })
        })

        if (this.state.admin) {
            this.ctx.setUser(this.state.admin)
        }
        this.ctx.setBooted(true)
    }
}

window.axios = Axios
window.Tensei = new Core()

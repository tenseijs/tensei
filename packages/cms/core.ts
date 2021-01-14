import Qs from 'qs'
import Axios from 'axios'
import Toasted from 'toastedjs'
import {
    Tensei,
    TenseiState,
    ToastOptions,
    ResourceContract,
    TenseiCtxInterface,
    TenseiRegisterFunction
} from '@tensei/components'

// Form
import IndexID from './index/ID'
import IndexText from './index/Text'

// Form
import DetailID from './detail/ID'
import DetailDate from './detail/Date'
import DetailText from './detail/Text'
import DetailBoolean from './detail/Boolean'
import DetailOneToOne from './detail/OneToOne'
import DetailTextarea from './detail/Textarea'
import DetailManyToMany from './detail/ManyToMany'

// Form
import FormText from './form/Text'
import FormSlug from './form/Slug'
import FormSelect from './form/Select'
import FormBoolean from './form/Boolean'
import FormDate from './form/DatePicker'
import FormTextarea from './form/Textarea'
import FormManyToOne from './form/ManyToOne'
import FormManyToMany from './form/ManyToMany'

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

    constructor() {
        const query = Qs.parse(window.location.search.split('?')[1])

        if (query.error) {
            this.error(query.error as string)
        }
    }

    toast = new Toasted({
        duration: 3000,
        position: 'bottom-right',
        theme: 'tensei'
    })

    private hooks: TenseiRegisterFunction[] = []

    components: Tensei['components'] = {
        form: {
            Text: FormText,
            Date: FormDate,
            Slug: FormSlug,
            Select: FormSelect,
            Boolean: FormBoolean,
            Textarea: FormTextarea,
            OneToOne: FormManyToOne,
            ManyToOne: FormManyToOne,
            ManyToMany: FormManyToMany,
            OneToMany: FormManyToMany
        },
        index: {
            ID: IndexID,
            Text: IndexText,
            Date: DetailDate,
            DateTime: DetailDate,
            Timestamp: DetailDate
        },
        detail: {
            ID: DetailID,
            Text: DetailText,
            Date: DetailDate,
            DateTime: DetailDate,
            Timestamp: DetailDate,
            Boolean: DetailBoolean,
            OneToOne: DetailOneToOne,
            Textarea: DetailTextarea,
            ManyToOne: DetailOneToOne,
            ManyToMany: DetailManyToMany,
            OneToMany: DetailManyToMany
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

    success = (message: string, options: ToastOptions = {}) => {
        this.toast.success(message, {
            type: 'success',
            ...options
        })
    }

    show = (message: string, options: ToastOptions = {}) => {
        this.toast.success(message, {
            ...options
        })
    }

    error = (message: string, options: ToastOptions = {}) => {
        this.toast.error(message, {
            type: 'error',
            ...options
        })
    }

    info = (message: string, options: ToastOptions = {}) => {
        this.toast.info(message, {
            type: 'info',
            ...options
        })
    }

    warning = (message: string, options: ToastOptions = {}) => {
        this.toast.info(message, {
            type: 'warning',
            ...options
        })
    }

    clear = () => {
        this.toast.clear()
    }
}

window.axios = Axios
window.Tensei = new Core()

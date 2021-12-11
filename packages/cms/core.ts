import Qs from 'qs'
import Axios, { AxiosRequestConfig } from 'axios'
import * as Lib from '@tensei/components'

// Form
import FormText from './form/text'
import FormTextarea from './form/textarea'
import FormNumber from './form/number'
import FormSlug from './form/slug'
import FormBoolean from './form/boolean'
import FormSelect from './form/select'
import { BelongsToMany as FormBelongsToMany } from './form/belongs-to-many'

// Index
import IndexBoolean from './index/boolean'
import IndexText from './index/text'
import IndexId from './index/id'
import IndexSlug from './index/slug'
import IndexNumber from './index/number'

class Core {
  state = (() => {
    let config = {}
    let admin = null
    let resources = []
    let permissions: {
      [key: string]: boolean
    } = {}
    let resourcesMap: {
      [key: string]: Lib.ResourceContract
    } = {}
    let registered = false

    const { ___tensei___ } = window

    try {
      config = JSON.parse(___tensei___.ctx)
      resources = JSON.parse(___tensei___.resources)
      registered = ___tensei___.shouldShowRegistrationScreen === 'false'

      resources.forEach((resource: any) => {
        resourcesMap[resource.name] = resource
      })

      admin = JSON.parse(___tensei___.admin || '')

      admin.adminPermissions.forEach((permission: string) => {
        permissions[permission] = true
      })
    } catch (errors) { }

    return {
      admin,
      config,
      resources,
      permissions,
      registered,
      resourcesMap
    } as Lib.TenseiState
  })()

  constructor() {
    const query = Qs.parse(window.location.search.split('?')[1])

    if (query.error) {
      // show an error message
    }
  }

  getPath = (path: string) => `/${this.state.config.dashboardPath}/${path}`

  private hooks: Lib.TenseiRegisterFunction[] = []

  lib: Lib.Tensei['lib'] = {
    ...Lib
  }

  components: Lib.Tensei['components'] = {
    form: {
      Slug: FormSlug,
      Text: FormText,
      Select: FormSelect,
      Integer: FormNumber,
      Boolean: FormBoolean,
      Textarea: FormTextarea,
      ManyToOne: FormBelongsToMany,
      ManyToMany: FormBelongsToMany
    },
    index: {
      Boolean: IndexBoolean,
      Text: IndexText,
      ID: IndexId,
      Slug: IndexSlug,
      Integer: IndexNumber,
      Textarea: IndexText
    }
  }

  routes: Lib.CmsRoute[] = []

  route = (route: Partial<Lib.CmsRoute>) => {
    this.routes.push({
      ...(route as any),
      path: this.getPath(route.path!),
      settings: route.settings || false,
      group: route.settings ? route.group || 'Global Settings' : '',
      requiredPermissions: route.requiredPermissions || []
    })
  }

  ctx: Lib.TenseiCtxInterface = {} as any

  client = Axios.create({
    baseURL: this.state.config.apiPath,
    xsrfCookieName: 'x-csrf-token'
  })

  api = {
    get: async (uri: string, config?: AxiosRequestConfig) => {
      try {
        const response = await this.client.get(uri, config)

        return [response, null] as any
      } catch (error) {
        return [null, error] as any
      }
    },
    post: async (uri: string, data?: any, config?: AxiosRequestConfig) => {
      try {
        const response = await this.client.post(uri, data, config)

        return [response, null] as any
      } catch (error) {
        return [null, error] as any
      }
    },
    put: async (uri: string, data?: any, config?: AxiosRequestConfig) => {
      try {
        const response = await this.client.put(uri, data, config)

        return [response, null] as any
      } catch (error) {
        return [null, error] as any
      }
    },
    patch: async (uri: string, data?: any, config?: AxiosRequestConfig) => {
      try {
        const response = await this.client.patch(uri, data, config)

        return [response, null] as any
      } catch (error) {
        return [null, error] as any
      }
    },
    delete: async (uri: string, config?: AxiosRequestConfig) => {
      try {
        const response = await this.client.delete(uri, config)

        return [response, null] as any
      } catch (error) {
        return [null, error] as any
      }
    }
  }

  register = (fn: Lib.TenseiRegisterFunction) => {
    this.hooks.push(fn)
  }

  formComponent = (name: string, Component: React.FC<any>) => {
    this.components.form[name] = Component
  }

  indexComponent = (name: string, Component: React.FC<any>) => {
    this.components.index[name] = Component
  }

  boot = () => {
    this.hooks.forEach(hook => {
      hook({
        route: this.route,
        formComponent: this.formComponent,
        indexComponent: this.indexComponent
      })
    })

    if (this.state.admin) {
      this.ctx.setUser(this.state.admin)
    }
    this.ctx.setRoutes([...this.ctx?.routes, ...this.routes])
    this.ctx.setBooted(true)
  }
}

window.axios = Axios
window.Tensei = new Core()

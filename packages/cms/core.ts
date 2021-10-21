import Qs from 'qs'
import Axios from 'axios'
import * as Lib from '@tensei/components'

// Form

// Index

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
        resourcesMap[resource.slug] = resource
      })

      admin = JSON.parse(___tensei___.admin || '')

      admin.adminPermissions.forEach((permission: string) => {
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
    form: {},
    index: {}
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
    this.ctx.setRoutes([...this.ctx.routes, ...this.routes])
    this.ctx.setBooted(true)
  }
}

window.axios = Axios
window.Tensei = new Core()

declare module '@tensei/common/actions' {
  import Express from 'express'
  import { DataPayload, ValidationError } from '@tensei/common/config'
  import { SerializedField, FieldContract } from '@tensei/common/fields'

  interface ActionFlashMessage {
    message: string
    variant?: 'positive' | 'negative' | 'warning'
    position?: 'top' | 'bottom'
  }

  type HtmlResponse = string
  type ActionResponse = Partial<ActionFlashMessage> & {
    status: number
    type: 'notification' | 'html' | 'validation-errors' | 'push'
    html?: HtmlResponse
    errors?: ValidationError[]
    route?: string
  }
  type ActionParams = {
    request: Express.Request | null
    models: any[]
    payload?: DataPayload
    html: (
      html: HtmlResponse,
      status?: number
    ) => {
      html: HtmlResponse
      type: 'html'
      status: number
    }
    notification: (
      flash: ActionFlashMessage,
      status?: number
    ) => ActionFlashMessage & {
      type: 'notification'
      status: number
    }
    errors: (
      errors: ValidationError[],
      status?: number
    ) => {
      errors: ValidationError[]
      type: 'validation-errors'
      status: number
    }
    push: (
      route: string,
      status?: number
    ) => {
      status: number
      type: 'push'
      route: string
    }
  }
  type ActionHandler = (
    actionParams: ActionParams
  ) => Promise<ActionResponse> | ActionResponse
  interface ActionData {
    intent: 'positive' | 'negative' | 'primary'
    slug: string
    confirmText: string
    confirmButtonText: string
    cancelButtonText: string
    handler: ActionHandler
  }
  interface ActionDataWithFields extends ActionData {
    fields: FieldContract[]
  }
  interface SerializedAction extends ActionData {
    name: string
    showOnIndex: boolean
    showOnDetail: boolean
    showOnTableRow: boolean
    fields: SerializedField[]
  }
  interface ActionContract {
    name: string
    data: ActionDataWithFields
    showHideField: {
      /**
       *
       * If this is true, the field will be shown on the
       * index page
       *
       */
      showOnIndex: boolean
      /**
       *
       * If this is true, the field will be updatable. It will
       * show up on the update page
       *
       */
      showOnTableRow: boolean
      /**
       *
       * If this is true, the field will show up on the detail page
       */
      showOnDetail: boolean
    }
    handle: (handler: ActionHandler) => this
    confirmText(confirmText: string): this
    confirmButtonText(confirmButtonText: string): this
    cancelButtonText(cancelButtonText: string): this
    /**
     *
     * Show this field on the index page
     */
    showOnIndex(): this
    /**
     *
     * Show this field on the detail page
     */
    showOnDetail(): this
    /**
     *
     * Show this field on the detail page
     */
    showOnTableRow(): this
    /**
     *
     * Hide this field on the index page
     */
    hideOnIndex(): this
    /**
     *
     * Hide this field from the detail page
     */
    hideOnDetail(): this
    /**
     *
     * Hide this field everywhere, except the index page
     */
    onlyOnIndex(): this
    /**
     *
     * Hide this field everywhere, except the index page
     */
    onlyOnDetail(): this
    /**
     *
     * Hide this field everywhere, except the table row page
     */
    onlyOnTableRow(): this
    negative(): this
    positive(): this
    fields(fields: FieldContract[]): this
    serialize(): SerializedAction
  }
  const action: (name: string) => ActionContract
}

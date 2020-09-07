import Express from 'express'
import { paramCase } from 'change-case'

import {
    FieldContract,
    ActionContract,
    SerializedField,
    DataPayload,
    ValidationError,
} from '@tensei/common'

export interface ActionFlashMessage {
    message: string
    variant?: 'positive' | 'negative' | 'warning'
    position?: 'top' | 'bottom'
}

export type HtmlResponse = string

export type ActionResponse = Partial<ActionFlashMessage> & {
    status: number
    type: 'notification' | 'html' | 'validation-errors' | 'push'
    html?: HtmlResponse
    errors?: ValidationError[]
    route?: string
}

export type ActionParams = {
    request: Express.Request
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

export type ActionHandler = (
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

export interface SerializedAction extends ActionData {
    name: string
    showOnIndex: boolean
    showOnDetail: boolean
    showOnTableRow: boolean
    fields: SerializedField[]
}

export class Action implements ActionContract {
    public data: ActionDataWithFields = {
        fields: [],
        slug: '',
        intent: 'primary',
        confirmText: 'Are you sure you want to run this action?',
        confirmButtonText: 'Run Action',
        cancelButtonText: 'Cancel',
        handler: () => ({
            message: 'Action has been run.',
            variant: 'positive',
            type: 'notification',
            status: 200,
        }),
    }

    public showHideField = {
        /**
         *
         * If this is true, the field will be shown on the
         * index page
         *
         */
        showOnIndex: true,

        /**
         *
         * If this is true, the field will be updatable. It will
         * show up on the update page
         *
         */
        showOnTableRow: false,

        /**
         *
         * If this is true, the field will show up on the detail page
         */
        showOnDetail: true,
    }

    constructor(public name: string) {
        this.setValue('slug', paramCase(name))
    }

    public handle = (handler: ActionHandler) => {
        this.setValue('handler', handler.bind(this))

        return this
    }

    public confirmText(confirmText: string) {
        this.setValue('confirmText', confirmText)

        return this
    }

    public confirmButtonText(confirmButtonText: string) {
        this.setValue('confirmButtonText', confirmButtonText)

        return this
    }

    public cancelButtonText(cancelButtonText: string) {
        this.setValue('cancelButtonText', cancelButtonText)

        return this
    }

    /**
     *
     * Show this field on the index page
     */
    public showOnIndex() {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: true,
        }

        return this
    }

    /**
     *
     * Show this field on the detail page
     */
    public showOnDetail() {
        this.showHideField = {
            ...this.showHideField,
            showOnDetail: true,
        }

        return this
    }

    /**
     *
     * Show this field on the detail page
     */
    public showOnTableRow() {
        this.showHideField = {
            ...this.showHideField,
            showOnTableRow: true,
        }

        return this
    }

    /**
     *
     * Hide this field on the index page
     */
    public hideOnIndex() {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: false,
        }

        return this
    }

    /**
     *
     * Hide this field from the detail page
     */
    public hideOnDetail() {
        this.showHideField = {
            ...this.showHideField,
            showOnDetail: false,
        }

        return this
    }

    /**
     *
     * Hide this field everywhere, except the index page
     */
    public onlyOnIndex() {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: true,
            showOnDetail: false,
        }

        return this
    }

    /**
     *
     * Hide this field everywhere, except the index page
     */
    public onlyOnDetail() {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: false,
            showOnDetail: true,
            showOnTableRow: false,
        }

        return this
    }

    /**
     *
     * Hide this field everywhere, except the table row page
     */
    public onlyOnTableRow() {
        this.showHideField = {
            ...this.showHideField,
            showOnIndex: false,
            showOnDetail: false,
            showOnTableRow: true,
        }

        return this
    }

    private setValue(key: keyof ActionDataWithFields, value: any) {
        this.data = {
            ...this.data,
            [key]: value,
        }
    }

    negative() {
        this.setValue('intent', 'negative')

        return this
    }

    positive() {
        this.setValue('intent', 'positive')

        return this
    }

    fields(fields: FieldContract[]) {
        this.setValue('fields', fields)

        return this
    }

    serialize(): SerializedAction {
        return {
            ...this.data,
            name: this.name,
            fields: this.data.fields.map((field) => field.serialize()),
            ...this.showHideField,
        }
    }
}

export const action = (name: string) => new Action(name)

export default Action

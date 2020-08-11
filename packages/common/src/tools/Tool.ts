import Express from 'express'
import { Asset } from '../config'
import { Resource } from '../resources/Resource'

export interface ToolSetupConfig {
    resources: Resource[]
    app: Express.Application
    style: (name: Asset['name'], path: Asset['path']) => void
    script: (name: Asset['name'], path: Asset['path']) => void
}

export type ToolSetupFunction = (config: ToolSetupConfig) => Promise<any>

export class Tool {
    public data = {
        setup: (config: ToolSetupConfig) => Promise.resolve()
    }

    constructor(public name: string) {}

    public setup(setupFunction: ToolSetupFunction) {
        this.data = {
            ...this.data,
            setup: setupFunction
        }

        return this
    }
}

export const tool = (name: string) => new Tool(name)

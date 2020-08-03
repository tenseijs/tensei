import Resource from './resources/Resource'

declare global {
    namespace Express {
        export interface Request {
            scripts: Array<any>
            styles: Array<any>
            db: any
            resources: Resource[]
        }
    }
}


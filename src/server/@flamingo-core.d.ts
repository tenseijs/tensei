declare namespace Express {
    export interface Request {
        scripts: Array<any>
        styles: Array<any>
        db: any
        resources: Array<any>
    }
}

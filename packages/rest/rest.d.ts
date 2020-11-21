import { Request } from 'express'

declare global {
    namespace Express {
        export interface Request {
            authenticationError: (message?: string) => unknown
            forbiddenError: (message?: string) => unknown
            validationError: (message?: string) => unknown
            userInputError: (message?: string) => unknown
        }
    }
}

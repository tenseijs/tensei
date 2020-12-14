import Csurf from 'csurf'
import { NextFunction, Request, Response } from 'express'

const Middleware = Csurf({
    cookie: true
})

const _nextWithoutCheck = (_next: NextFunction) => (error: any) =>
    error && error.code !== 'EBADCSRFTOKEN' ? _next(error) : _next()

export const createCsurfToken = () => (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    const _middleware = Middleware(request, response, _nextWithoutCheck(next))

    response.cookie('x-csrf-token', request.csrfToken(), {
        secure: process.env.NODE_ENV === 'production'
    })

    return _middleware
}

export const checkCsurfToken = () => Middleware

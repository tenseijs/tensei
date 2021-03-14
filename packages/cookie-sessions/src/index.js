const Csurf = require('csurf')

const Middleware = Csurf({
    cookie: true
})

const _nextWithoutCheck = (_next) => (error) =>
    error && error.code !== 'EBADCSRFTOKEN' ? _next(error) : _next()

const createCsurfToken = () => (
    request,
    response,
    next
) => {
    const _middleware = Middleware(request, response, _nextWithoutCheck(next))

    response.cookie('x-csrf-token', request.csrfToken(), {
        secure: process.env.NODE_ENV === 'production'
    })

    return _middleware
}

const checkCsurfToken = () => Middleware

module.exports = {
    register: ({ app }) => {
        app.use((request, response, next) => {
            const query = request.body?.query
                ?.replace(/(\r\n|\n|\r)/gm, '')
                ?.replace(/\s/g, '')

            const queryAccepted =
                query === '{csrf_token}' ||
                (query?.startsWith('query') &&
                    query?.endsWith('{csrf_token}'))

            if (
                request.method === 'POST' &&
                typeof query === 'string' &&
                queryAccepted
            ) {
                return createCsurfToken()(request, response, next)
            }

            return checkCsurfToken()(request, response, next)
        })
    }
}

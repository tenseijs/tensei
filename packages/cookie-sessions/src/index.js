const Csurf = require('csurf')
const PathToRegex = require('path-to-regexp')

const Middleware = Csurf({
    cookie: {
        key: 'xsrf-token'
    }
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
    register: ({ app, excludedPaths }) => {
        const excludedPathsRegex = (excludedPaths || []).map(path => PathToRegex(path.startsWith('/') ? path : `/${path}`))

        app.use((request, response, next) => {
            const query = request.body?.query
                ?.replace(/(\r\n|\n|\r)/gm, '')
                ?.replace(/\s/g, '')

            const queryAccepted =
                query === '{csrf_token}' ||
                (query?.startsWith('query') &&
                    query?.endsWith('{csrf_token}'))

                    const pathIsExcluded = excludedPathsRegex.find(regex => regex.test(request.path) === true)
            if (
                (
                    request.method === 'POST' &&
                    typeof query === 'string' &&
                    queryAccepted
                ) || pathIsExcluded
            ) {
                return createCsurfToken()(request, response, next)
            }

            return checkCsurfToken()(request, response, next)
        })
    }
}

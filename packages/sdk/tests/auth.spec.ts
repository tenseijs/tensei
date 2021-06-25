import Axios from 'axios'
import { AuthAPI, LocalStorageStore } from '../src/auth'

test('can login with email and password authentication', async () => {
    const instance = Axios.create({})

    const responsePayload = {
        data: {
            data: {
                access_token: 'ACCESS_TOKEN',
                refresh_token: 'REFRESH_TOKEN',
                expires_in: 60
            }
        }
    }

    const mock = jest.spyOn(instance, 'post').mockImplementation(async (url, data, options) => responsePayload)

    const api = new AuthAPI(instance, {
        refreshTokens: true
    })

    const user = {
        email: 'hey@tenseijs.com',
        password: 'password',
    }

    const response = await api.login({
        object: user
    })

    expect(response).toEqual(responsePayload)
    expect(api.session()).toEqual(responsePayload.data.data)
    expect(mock).toHaveBeenCalledWith('login', {
        email: 'hey@tenseijs.com',
        password: 'password',
    })
    expect(instance.defaults.headers.common.Authorization).toBe(`Bearer ${responsePayload.data.data.access_token}`)

    const storage = new LocalStorageStore('___tensei__session___')

    expect(storage.get()).toEqual({
        access_token_expires_in: responsePayload.data.data.expires_in,
        refresh_token: responsePayload.data.data.refresh_token,
        current_time: expect.any(String)
    })
})

test('can login with access tokens', async () => {
    const instance = Axios.create({})

    const responsePayload = {
        data: {
            data: {
                access_token: 'ACCESS_TOKEN',
                refresh_token: 'REFRESH_TOKEN',
                user: {
                    id: 1,
                    email: 'hey@tenseijs.com',
                    name: 'Hey Tensei'
                },
                expires_in: 60
            }
        }
    }

    const mock = jest.spyOn(instance, 'post').mockImplementation(async (url, data, options) => responsePayload)

    const api = new AuthAPI(instance)

    const user = {
        email: 'hey@tenseijs.com',
        password: 'password',
    }

    const response = await api.login({
        object: user
    })

    expect(response).toEqual(responsePayload)
    expect(api.session()).toEqual(responsePayload.data.data)
    expect(mock).toHaveBeenCalledWith('login', {
        email: 'hey@tenseijs.com',
        password: 'password',
    })
    expect(instance.defaults.headers.common.Authorization).toBe(`Bearer ${responsePayload.data.data.access_token}`)

    const storage = new LocalStorageStore('___tensei__session___')

    expect(storage.get()).toEqual({
        current_time: expect.any(String),
        access_token_expires_at: expect.any(String),
        expires_in: responsePayload.data.data.expires_in,
        access_token: responsePayload.data.data.access_token,
    })
})

test('can register with email and password authentication', async () => {
    const instance = Axios.create({})

    const responsePayload = {
        data: {
            data: {
                access_token: 'ACCESS_TOKEN',
                refresh_token: 'REFRESH_TOKEN',
                expires_in: 60
            }
        }
    }

    const mock = jest.spyOn(instance, 'post').mockImplementation(async (url, data, options) => responsePayload)

    const api = new AuthAPI(instance, {
        refreshTokens: true
    })

    const user = {
        email: 'hey@tenseijs.com',
            password: 'password',
    }

    const response = await api.register({
        object: user
    })

    expect(response).toEqual(responsePayload)
    expect(api.session()).toEqual(responsePayload.data.data)
    expect(mock).toHaveBeenCalledWith('register', {
        email: 'hey@tenseijs.com',
        password: 'password',
    })
    expect(instance.defaults.headers.common.Authorization).toBe(`Bearer ${responsePayload.data.data.access_token}`)

    const storage = new LocalStorageStore('___tensei__session___')

    expect(storage.get()).toEqual({
        access_token_expires_in: responsePayload.data.data.expires_in,
        refresh_token: responsePayload.data.data.refresh_token,
        current_time: expect.any(String)
    })
})

test('can enable two factor auth', async () => {
    const instance = Axios.create({})

    const responsePayload = {
        data: {
            data: {
                customer: {
                    id: 1,
                    email: 'test@customer.com',
                },
                dataURL: 'TEST_DATA_URL'
            }
        }
    }

    const mock = jest.spyOn(instance, 'post').mockImplementation(async (url, data, options) => responsePayload)

    const api = new AuthAPI(instance)

    await api.enableTwoFactor()

    expect(mock).toHaveBeenCalledWith('two-factor/enable')
})

test('can disable two factor auth', async () => {
    const instance = Axios.create({})

    const responsePayload = {
        data: {
            data: {
                customer: {
                    id: 1,
                    email: 'test@customer.com',
                    two_factor_disabled: true
                },
                dataURL: 'TEST_DATA_URL'
            }
        }
    }

    const mock = jest.spyOn(instance, 'post').mockImplementation(async (url, data, options) => responsePayload)

    const api = new AuthAPI(instance)

    await api.disableTwoFactor({
        object: {
            token: 555555
        }
    })

    expect(mock).toHaveBeenCalledWith('two-factor/disable', {
        token: 555555
    })
})

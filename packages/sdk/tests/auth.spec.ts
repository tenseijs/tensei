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

    const api = new AuthAPI(instance)

    const user = {
        email: 'hey@tenseijs.com',
            password: 'password',
    }

    const response = await api.login({
        object: user
    })

    expect(response).toMatchObject(responsePayload)
    expect(api.session()).toMatchObject(responsePayload.data.data)
    expect(mock).toHaveBeenCalledWith('login', {
        email: 'hey@tenseijs.com',
        password: 'password',
    })
    expect(instance.defaults.headers.common.Authorization).toBe(`Bearer ${responsePayload.data.data.access_token}`)

    const storage = new LocalStorageStore('___tensei__session___')

    expect(storage.get()).toMatchObject({
        access_token_expires_in: responsePayload.data.data.expires_in,
        refresh_token: responsePayload.data.data.refresh_token,
        current_time: expect.any(String)
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

    const api = new AuthAPI(instance)

    const user = {
        email: 'hey@tenseijs.com',
            password: 'password',
    }

    const response = await api.register({
        object: user
    })

    expect(response).toMatchObject(responsePayload)
    expect(api.session()).toMatchObject(responsePayload.data.data)
    expect(mock).toHaveBeenCalledWith('register', {
        email: 'hey@tenseijs.com',
        password: 'password',
    })
    expect(instance.defaults.headers.common.Authorization).toBe(`Bearer ${responsePayload.data.data.access_token}`)

    const storage = new LocalStorageStore('___tensei__session___')

    expect(storage.get()).toMatchObject({
        access_token_expires_in: responsePayload.data.data.expires_in,
        refresh_token: responsePayload.data.data.refresh_token,
        current_time: expect.any(String)
    })
})

import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export interface SdkOptions {
    url?: string
    axiosInstance?: AxiosInstance
    axiosRequestConfig?: Omit<AxiosRequestConfig, 'baseURL'>
}

class BaseSdk {
    private instance: AxiosInstance

    constructor(private options?: SdkOptions) {
        this.instance =
        options?.axiosInstance ||
        Axios.create({
            baseURL: this.options?.url || 'http://localhost:8810',
            ...(options?.axiosRequestConfig || {}),
        })
    }
}

export class Sdk extends BaseSdk {
    constructor(options?: SdkOptions) {
        super(options)

        return new Proxy(this, {
            get(target, method) {
                if (target[method] === undefined) {
                    return function () {
                        return {
                            findMany() {
                                console.log('#++++ findMany', method)
                            },
                            insertMany() {
                                console.log('#+++++ insertMany', method)
                            }
                        }
                    }
                }

                return target[method]
            }
        })
    }
}
  

// So we'll have initial types. These types will be a bunch of "any". This will be on CI, so CI does not fail.
// In development, when they run the API server locally, 

// Maybe frontend devs can run "yarn sdk generate --url=http://localhost:8810".
// This will call the API, and fetch all the types, and write those types to the types file for this package.

// The sdk on the backend will have the option of automatically syncing the frontend after a file change.
// @tensei/sdk -> client side package
// @tensei/sdk-generator 

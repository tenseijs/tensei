import 'proxy-polyfill'

import Axios, { AxiosInstance } from 'axios'

import { AuthAPI } from './auth'
import { SdkOptions } from './config'

let dashed = (s: string) => s.replace(/[A-Z]/g, '-$&').toLowerCase()

class BaseSdk {
  private authInstance: AuthAPI

  public instance: AxiosInstance

  public auth() {
    return this.authInstance
  }

  constructor(public options?: SdkOptions) {
    this.instance =
      options?.axiosInstance ||
      Axios.create({
        baseURL: this.options?.url || 'http://localhost:8810/api',
        ...(options?.axiosRequestConfig || {})
      })
    this.authInstance = new AuthAPI(this.instance, this.options)
    this.instance.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
  }
}

function getSdk(instance: any, slug: string) {
  return function () {
    return {
      find(payload: any = {}) {
        return instance.get(`${slug}/${payload.id}`)
      },
      findMany(payload: any = {}) {
        return instance.get(slug, {
          params: {
            populate: payload?.populate?.join(',') || [],
            perPage: payload?.pagination?.perPage,
            page: payload?.pagination?.page,
            fields: payload?.fields?.join(',') || undefined,
            where: payload?.where
          }
        })
      },
      insert(payload: any) {
        return instance.post(slug, payload.object)
      },
      insertMany(payload: any) {
        return instance.post(`${slug}/bulk`, payload)
      },
      update(payload: any) {
        return instance.patch(`${slug}/${payload.id}`, payload.object)
      },
      updateMany(payload: any) {
        return instance.patch(`${slug}/bulk`, payload)
      },
      delete(payload: any) {
        return instance.delete(`${slug}/${payload.id}`)
      },
      deleteMany(payload: any) {
        return instance.delete(slug, {
          params: {
            where: payload.where
          }
        })
      }
    }
  }
}

export class Sdk extends BaseSdk {
  constructor(public options?: SdkOptions) {
    super(options)

    const { instance } = this

    return new Proxy(this, {
      get(target: any, method) {
        if (target[method] === undefined) {
          return getSdk(instance, dashed(method.toString()))
        }

        return target[method]
      }
    })
  }
}

export const sdk = (options?: SdkOptions) => new Sdk(options)

export enum SortQueryInput {
  ASC = 'asc',
  ASC_NULLS_LAST = 'asc_nulls_last',
  ASC_NULLS_FIRST = 'asc_nulls_first',
  DESC = 'desc',
  DESC_NULLS_LAST = 'desc_nulls_last',
  DESC_NULLS_FIRST = 'desc_nulls_first'
}

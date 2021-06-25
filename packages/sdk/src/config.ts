import { AxiosInstance, AxiosRequestConfig } from 'axios'

export interface SdkOptions {
	url?: string
	refreshTokens?: boolean
	axiosInstance?: AxiosInstance
	axiosRequestConfig?: Omit<AxiosRequestConfig, 'baseURL'>
}

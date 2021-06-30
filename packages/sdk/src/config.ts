import { AxiosInstance, AxiosRequestConfig } from 'axios'

export interface SdkOptions {
	url?: string
	noStorage?: boolean
	refreshTokens?: boolean
	axiosInstance?: AxiosInstance
	axiosRequestConfig?: Omit<AxiosRequestConfig, 'baseURL'>
}

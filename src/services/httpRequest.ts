import axios, { AxiosRequestConfig } from 'axios'
import type { ApiError } from './errors'

/**
 * Axios instance
 */
const http = axios.create({
  timeout: 15_000,
  withCredentials: true, 
})

/**
 * Error mapper 
 */
function mapAxiosError(error: any): ApiError {
  if (!error.response) {
    return { type: 'NETWORK_ERROR' }
  }

  const status = error.response.status

  switch (status) {
    case 400:
      return { type: 'VALIDATION_ERROR' }
    case 401:
      return { type: 'UNAUTHORIZED' }
    case 403:
      return { type: 'FORBIDDEN' }
    case 404:
      return { type: 'NOT_FOUND' }
    case 409:
      return { type: 'SERVER_ERROR' }
    case 500:
    case 502:
    case 503:
      return { type: 'SERVER_ERROR' }
    default:
      return { type: 'UNKNOWN_ERROR', cause: error }
  }
}

/**
 * Core request wrapper
 */
async function request<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<{ data: T }> {
  try {
    const response = await http.request<T>({
      method,
      url,
      data,
      ...config,
    })

    return { data: response.data }
  } catch (error: any) {
    throw mapAxiosError(error)
  }
}

/**
 * Public API
 */
export function get<T>(
  url: string,
  config?: AxiosRequestConfig
) {
  return request<T>('get', url, undefined, config)
}

export function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  return request<T>('post', url, data, config)
}

export function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  return request<T>('put', url, data, config)
}

export function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  return request<T>('patch', url, data, config)
}

export function del<T>(
  url: string,
  config?: AxiosRequestConfig
) {
  return request<T>('delete', url, undefined, config)
}
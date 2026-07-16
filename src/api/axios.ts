import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import useAuthStore from '../store/auth.store';
import ENDPOINTS from './endpoints';
import { API_CONFIG, apiUrl } from './config';
import { ApiEnvelope, ApiError, ApiErrorBody } from './types';

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const applyAuthHeader = (
  headers: InternalAxiosRequestConfig['headers'],
  token: string
): InternalAxiosRequestConfig['headers'] => {
  const nextHeaders = new AxiosHeaders(headers ?? {});
  nextHeaders.set('Authorization', `Bearer ${token}`);
  return nextHeaders;
};

const createApiClient = () => {
  const client = axios.create({
    baseURL: apiUrl(''),
    timeout: API_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers = applyAuthHeader(config.headers, token);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorBody>) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post<ApiEnvelope<{ token: string }>>(
            apiUrl(ENDPOINTS.auth.refreshToken),
            {}
          );

          const newToken = refreshResponse.data.data?.token;
          if (!newToken) {
            throw new Error('The refresh response did not include a token.');
          }

          useAuthStore.getState().setToken(newToken);
          originalRequest.headers = applyAuthHeader(originalRequest.headers, newToken);

          return client.request(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          return Promise.reject(
            refreshError instanceof Error
              ? refreshError
              : new ApiError({
                  statusCode: 0,
                  messages: ['Unable to refresh the session. Please sign in again.'],
                  isNetworkError: true,
                })
          );
        }
      }

      const body = error.response?.data;
      const messages = Array.isArray(body?.message)
        ? body.message
        : [body?.message ?? 'An unexpected error occurred'];

      return Promise.reject(
        new ApiError({
          statusCode: error.response?.status ?? 0,
          error: body?.error,
          messages,
          correlationId: body?.correlationId,
          path: body?.path,
          isNetworkError: !error.response,
        })
      );
    }
  );

  return client;
};

export const apiClient = createApiClient();
export default apiClient;

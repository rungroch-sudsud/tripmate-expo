// axios.ts
import axios from 'axios';
import { requirements } from '../app/requirement';

// Token storage utilities
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';

  static getAccessToken(): string | null {
    // Use secure storage in production (like react-native-keychain)
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}

const axiosInstance = axios.create({
  baseURL: `${requirements.baseURL}`,
  timeout: 10000,
});

// Request interceptor: adds access token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const accessToken = TokenManager.getAccessToken();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('Access token added to request header');
      } else {
        console.log('No access token found');
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle token expiration and refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        
        if (refreshToken) {
          // Call your token refresh endpoint
          const refreshResponse = await axios.post(`${requirements.baseURL}/auth/refresh`, {
            refresh_token: refreshToken
          });

          const { access_token, refresh_token: newRefreshToken } = refreshResponse.data;
          
          // Store new tokens
          TokenManager.setAccessToken(access_token);
          if (newRefreshToken) {
            TokenManager.setRefreshToken(newRefreshToken);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          console.log('Access token refreshed and retrying request');
          
          return axiosInstance(originalRequest);
        } else {
          console.log('No refresh token available, user needs to login');
          // Redirect to login or handle unauthenticated state
          TokenManager.clearTokens();
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        TokenManager.clearTokens();
        // Redirect to login page
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstance, TokenManager };
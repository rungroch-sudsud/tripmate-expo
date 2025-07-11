// axios.ts
import {auth} from '../firebaseConfig'; // Import from your config file
import axios from 'axios';
import {requirements} from '../requirement'

const axiosInstance = axios.create({
  baseURL: `${requirements.baseURL}`,
  timeout: 10000,
});

// Request interceptor: adds Firebase ID token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const idToken = await currentUser.getIdToken(true);
        config.headers.Authorization = `Bearer ${idToken}`;
        console.log('Token added to request header'); // Debug log
      } else {
        console.log('No current user found'); // Debug log
      }
    } catch (error) {
      console.error('Error getting Firebase token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log('Token refreshed and retrying request');
          
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstance };
import { AxiosRequestConfig, AxiosResponse, default as axios } from 'axios';
import { axiosInstance } from '../axios';
import { auth } from '../../firebaseConfig';
import { requirements } from '../../requirement';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Firebase auth
jest.mock('../../firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock requirements
jest.mock('../../requirement', () => ({
  requirements: {
    baseURL: 'https://api.tripmate.club',
    apiKey: 'test-api-key',
    authDomain: 'test-auth-domain',
    projectId: 'test-project-id',
    storageBucket: 'test-storage-bucket',
    messagingSenderId: 'test-sender-id',
    appId: 'test-app-id',
    stream_api_key: 'test-stream-key',
    stream_api_secret: 'test-stream-secret',
  },
}));

// Define extended types for testing
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

interface MockError {
  response?: {
    status: number;
  };
  config: ExtendedAxiosRequestConfig;
  message?: string;
}

// Mock console methods to avoid noise in tests
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
};

describe('axiosInstance', () => {
  let mockAxiosCreate: jest.Mock;
  let mockRequestInterceptor: jest.Mock;
  let mockResponseInterceptor: jest.Mock;
  let mockInstance: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock axios interceptors
    mockRequestInterceptor = jest.fn();
    mockResponseInterceptor = jest.fn();
    
    mockInstance = {
      interceptors: {
        request: {
          use: mockRequestInterceptor,
        },
        response: {
          use: mockResponseInterceptor,
        },
      },
    };

    mockAxiosCreate = jest.fn().mockReturnValue(mockInstance);
    mockedAxios.create = mockAxiosCreate;

    // Reset auth mock
    (auth as any).currentUser = null;
  });

  afterEach(() => {
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('Axios Instance Creation', () => {
    it('should create axios instance with correct configuration', () => {
      // Re-import to trigger the creation
      require('../axios');
      
      expect(mockAxiosCreate).toHaveBeenCalledWith({
        baseURL: 'https://api.tripmate.club',
        timeout: 10000,
      });
    });

    it('should setup request and response interceptors', () => {
      require('../axios');
      
      expect(mockRequestInterceptor).toHaveBeenCalled();
      expect(mockResponseInterceptor).toHaveBeenCalled();
    });
  });

  describe('Request Interceptor', () => {
    let requestInterceptor: any;

    beforeEach(() => {
      require('../axios');
      requestInterceptor = mockRequestInterceptor.mock.calls[0][0];
    });

    it('should add Authorization header when user is authenticated', async () => {
      // Mock authenticated user
      const mockUser = {
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      };
      (auth as any).currentUser = mockUser;

      const config: ExtendedAxiosRequestConfig = { 
        headers: {} as any 
      };
      const result = await requestInterceptor(config);

      expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
      expect(result.headers!.Authorization).toBe('Bearer mock-token');
      expect(consoleSpy.log).toHaveBeenCalledWith('Token added to request header');
    });

    it('should not add Authorization header when user is not authenticated', async () => {
      (auth as any).currentUser = null;

      const config: ExtendedAxiosRequestConfig = { 
        headers: {} as any 
      };
      const result = await requestInterceptor(config);

      expect(result.headers!.Authorization).toBeUndefined();
      expect(consoleSpy.log).toHaveBeenCalledWith('No current user found');
    });

    it('should handle token retrieval errors gracefully', async () => {
      const mockError = new Error('Token retrieval failed');
      const mockUser = {
        getIdToken: jest.fn().mockRejectedValue(mockError),
      };
      (auth as any).currentUser = mockUser;

      const config: ExtendedAxiosRequestConfig = { 
        headers: {} as any 
      };
      const result = await requestInterceptor(config);

      expect(consoleSpy.error).toHaveBeenCalledWith('Error getting Firebase token:', mockError);
      expect(result.headers!.Authorization).toBeUndefined();
      expect(result).toBe(config);
    });

    it('should return config unchanged on success', async () => {
      const mockUser = {
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      };
      (auth as any).currentUser = mockUser;

      const config: ExtendedAxiosRequestConfig = { 
        headers: {} as any, 
        url: '/test' 
      };
      const result = await requestInterceptor(config);

      expect(result).toEqual({
        headers: { Authorization: 'Bearer mock-token' },
        url: '/test',
      });
    });
  });

  describe('Request Interceptor Error Handler', () => {
    let requestErrorHandler: any;

    beforeEach(() => {
      require('../axios');
      requestErrorHandler = mockRequestInterceptor.mock.calls[0][1];
    });

    it('should reject with the error', async () => {
      const mockError = new Error('Request error');
      
      await expect(requestErrorHandler(mockError)).rejects.toBe(mockError);
    });
  });

  describe('Response Interceptor', () => {
    let responseInterceptor: any;
    let responseErrorHandler: any;

    beforeEach(() => {
      require('../axios');
      responseInterceptor = mockResponseInterceptor.mock.calls[0][0];
      responseErrorHandler = mockResponseInterceptor.mock.calls[0][1];
    });

    it('should return response unchanged on success', () => {
      const mockResponse = { data: 'test data', status: 200 };
      const result = responseInterceptor(mockResponse);
      
      expect(result).toBe(mockResponse);
    });

    describe('Response Error Handler', () => {
      it('should retry request with new token on 401 error', async () => {
        const mockUser = {
          getIdToken: jest.fn().mockResolvedValue('new-token'),
        };
        (auth as any).currentUser = mockUser;

        const mockError: MockError = {
          response: { status: 401 },
          config: { 
            headers: {} as any 
          },
        };

        const mockRetryResponse = { data: 'retry success' };
        mockInstance.mockReturnValue(Promise.resolve(mockRetryResponse));

        const result = await responseErrorHandler(mockError);

        expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
        expect(mockError.config.headers!.Authorization).toBe('Bearer new-token');
        expect(mockError.config._retry).toBe(true);
        expect(consoleSpy.log).toHaveBeenCalledWith('Token refreshed and retrying request');
        expect(result).toBe(mockRetryResponse);
      });

      it('should not retry if _retry flag is already set', async () => {
        const mockError: MockError = {
          response: { status: 401 },
          config: { 
            headers: {} as any, 
            _retry: true 
          },
        };

        await expect(responseErrorHandler(mockError)).rejects.toBe(mockError);
      });

      it('should not retry on non-401 errors', async () => {
        const mockError: MockError = {
          response: { status: 500 },
          config: { 
            headers: {} as any 
          },
        };

        await expect(responseErrorHandler(mockError)).rejects.toBe(mockError);
      });

      it('should handle token refresh failure', async () => {
        const mockUser = {
          getIdToken: jest.fn().mockRejectedValue(new Error('Token refresh failed')),
        };
        (auth as any).currentUser = mockUser;

        const mockError: MockError = {
          response: { status: 401 },
          config: { 
            headers: {} as any 
          },
        };

        await expect(responseErrorHandler(mockError)).rejects.toBe(mockError);
        expect(consoleSpy.error).toHaveBeenCalledWith('Token refresh failed:', expect.any(Error));
      });

      it('should handle case when no current user during retry', async () => {
        (auth as any).currentUser = null;

        const mockError: MockError = {
          response: { status: 401 },
          config: { 
            headers: {} as any 
          },
        };

        await expect(responseErrorHandler(mockError)).rejects.toBe(mockError);
        expect(mockError.config._retry).toBe(true);
      });

      it('should handle errors without response object', async () => {
        const mockError: MockError = {
          config: { 
            headers: {} as any 
          },
          message: 'Network Error',
        };

        await expect(responseErrorHandler(mockError)).rejects.toBe(mockError);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should export axiosInstance', () => {
      const { axiosInstance } = require('../axios');
      expect(axiosInstance).toBeDefined();
    });
  });
});
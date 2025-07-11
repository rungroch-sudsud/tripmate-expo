import * as authService from '../authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance } from '../../../lib/axios';
import { User } from 'firebase/auth';
import { STORAGE_KEYS, API_STATUS, NAVIGATION_ROUTES } from '../../../shared/constants/keysAndRoutes';
import { AxiosError } from 'axios';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock axios instance
jest.mock('../../../lib/axios', () => ({
  __esModule: true,
  axiosInstance: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe('authServices', () => {
  const mockUser: User = {
    uid: '12345',
    displayName: 'Test User',
    email: 'test@gmail.com',
    emailVerified: false,
    isAnonymous: false,
    providerId: 'firebase',
    metadata: {
      creationTime: '',
      lastSignInTime: '',
      toJSON: () => ({}),
    } as any,
    phoneNumber: null,
    photoURL: null,
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    getIdToken: jest.fn().mockResolvedValue('id-token-xyz'),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeUserTokens', () => {
    it('should store user tokens correctly with access token', async () => {
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);
      
      const result = await authService.storeUserTokens(mockUser, 'access-token-abc');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_ID, mockUser.uid);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN, 'access-token-abc');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.GOOGLE_ID_TOKEN, 'id-token-xyz');
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(3);
      expect(result).toBe(true);
    });

    it('should store user tokens correctly without access token', async () => {
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);
      
      const result = await authService.storeUserTokens(mockUser);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_ID, mockUser.uid);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.GOOGLE_ID_TOKEN, 'id-token-xyz');
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it('should return false when storage fails', async () => {
      const error = new Error('Storage failed');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAsyncStorage.setItem.mockRejectedValue(error);
      
      const result = await authService.storeUserTokens(mockUser);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to store user tokens:', error);
      expect(result).toBe(false);
      consoleErrorSpy.mockRestore();
    });

    it('should handle case when getIdToken returns null', async () => {
      const mockUserWithoutToken = {
        ...mockUser,
        getIdToken: jest.fn().mockResolvedValue(null),
      };
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);
      
      const result = await authService.storeUserTokens(mockUserWithoutToken);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_ID, mockUser.uid);
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should handle case when getIdToken throws error', async () => {
      const mockUserWithTokenError = {
        ...mockUser,
        getIdToken: jest.fn().mockRejectedValue(new Error('Token error')),
      };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await authService.storeUserTokens(mockUserWithTokenError);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearStoredTokens', () => {
    it('should remove user-related keys successfully', async () => {
      mockedAsyncStorage.removeItem.mockResolvedValue(undefined);    
      const result = await authService.clearStoredTokens();
      
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.GOOGLE_ID_TOKEN);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_ID);
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(3);
      expect(result).toBe(true);
    });

    it('should return false when removal fails', async () => {
      const error = new Error('Removal failed');
      mockedAsyncStorage.removeItem.mockRejectedValue(error);
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = await authService.clearStoredTokens();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to clear stored tokens:', error);
      expect(result).toBe(false);
      consoleWarnSpy.mockRestore();
    });
  });

  describe('getUserProfile', () => {
    it('should return user data on successful request', async () => {
      const mockProfile = { age: 25, name: 'Test User' };
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { data: mockProfile }
      });

      const result = await authService.getUserProfile('12345');
      
      expect(axiosInstance.get).toHaveBeenCalledWith('/users/profile/12345');
      expect(result).toEqual(mockProfile);
    });

    it('should return null when user profile not found (404)', async () => {
      const mockError = {
        response: { status: 404, data: 'Not found' }
      };
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(mockError);

      const result = await authService.getUserProfile('12345');
      
      expect(consoleLogSpy).toHaveBeenCalledWith('User profile not found for userId: 12345');
      expect(result).toBeNull();
      consoleLogSpy.mockRestore();
    });

    it('should return null on internal server error (500)', async () => {
      const mockError = {
        response: { status: 500, data: 'Server error' }
      };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(mockError);

      const result = await authService.getUserProfile('12345');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Internal server error while fetching user profile:',
        'Server error'
      );
      expect(result).toBeNull();
      consoleErrorSpy.mockRestore();
    });

    it('should return null on other HTTP errors', async () => {
      const mockError = {
        response: { status: 403, data: 'Forbidden' }
      };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(mockError);

      const result = await authService.getUserProfile('12345');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'HTTP error 403 while fetching user profile:',
        'Forbidden'
      );
      expect(result).toBeNull();
      consoleErrorSpy.mockRestore();
    });

    it('should return null on network error', async () => {
      const mockError = {
        request: {},
        message: 'Network Error'
      };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(mockError);

      const result = await authService.getUserProfile('12345');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Network error while fetching user profile:',
        'Network Error'
      );
      expect(result).toBeNull();
      consoleErrorSpy.mockRestore();
    });

    it('should return null on other errors', async () => {
      const mockError = {
        message: 'Unknown error'
      };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(mockError);

      const result = await authService.getUserProfile('12345');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching user profile:',
        'Unknown error'
      );
      expect(result).toBeNull();
      consoleErrorSpy.mockRestore();
    });

    it('should return null on non-200 status', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 204,
        data: { data: null }
      });

      const result = await authService.getUserProfile('12345');
      
      expect(result).toBeNull();
    });
  });

 describe('createUserProfile', () => {
    it('should throw error when user ID is missing', async () => {
      const mockUserWithoutId = { ...mockUser, uid: '' };
      
      await expect(authService.createUserProfile(mockUserWithoutId))
        .rejects.toThrow('User ID is required');
    });

    it('should create user profile successfully for new user', async () => {
      mockedAxios.post.mockResolvedValue({
        status: API_STATUS.SUCCESS,
        data: { data: { userId: '12345' } }
      });
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await authService.createUserProfile(mockUser);
      
      expect(axiosInstance.post).toHaveBeenCalledWith('/users/profile', {
        userId: '12345',
        profileImageUrl: "N/A",
        idCardImageUrl: "N/A",
        portraitImageUrl: "N/A",
        travelStyles: ["N/A"],
        nickname: "N/A",
        lineId: "N/A",
        fullname: 'Test User',
        facebookUrl: "N/A",
        email: 'test@gmail.com',
        destinations: ["N/A"],
        age: -999,
        phoneNumber: "N/A",
        gender: "ชาย",
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_ID, '12345');
      expect(result).toEqual({
        success: true,
        route: NAVIGATION_ROUTES.TRAVEL_STYLE,
        type: 'new_user',
        userData: { userId: '12345' }
      });
    });
     
    it('should handle user with no display name or email', async () => {
      const mockUserMinimal = {
        ...mockUser,
        displayName: null,
        email: null,
      };
      
      mockedAxios.post.mockResolvedValue({
        status: API_STATUS.SUCCESS,
        data: { data: { userId: '12345' } }
      });
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await authService.createUserProfile(mockUserMinimal);
      
      expect(axiosInstance.post).toHaveBeenCalledWith('/users/profile', 
        expect.objectContaining({
          fullname: "N/A",
          email: "N/A",
        }), 
        expect.any(Object)
      );
    });

    it('should handle unexpected success status', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 202, // Not API_STATUS.SUCCESS
        data: { data: { userId: '12345' } }
      });
      
      await expect(authService.createUserProfile(mockUser))
        .rejects.toThrow('Network error - please check your connection');
    });

    it('should handle server errors through handleProfileError', async () => {
      const serverError = {
        response: { status: 500 }
      } as AxiosError;
      
      mockedAxios.post.mockRejectedValue(serverError);
      
      await expect(authService.createUserProfile(mockUser))
        .rejects.toThrow('Server error - please try again later');
    });
  });

 
  describe('handleProfileError', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');

      await expect(authService.handleProfileError(networkError, mockUser))
        .rejects.toThrow('Network error - please check your connection');
    });

    it('should handle conflict with complete existing profile', async () => {
      const conflictError = {
        response: { status: API_STATUS.CONFLICT }
      } as AxiosError;
      
      const mockProfile = { age: 25, name: 'Test User' };
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { data: mockProfile }
      });
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await authService.handleProfileError(conflictError, mockUser);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_ID, mockUser.uid);
      expect(result).toEqual({
        success: true,
        route: NAVIGATION_ROUTES.FIND_TRIPS,
        type: 'existing_user',
        userData: mockProfile
      });
    });

    it('should handle conflict with incomplete existing profile', async () => {
      const conflictError = {
        response: { status: API_STATUS.CONFLICT }
      } as AxiosError;
      
      const mockIncompleteProfile = { age: -999, name: 'Test User' };
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { data: mockIncompleteProfile }
      });
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await authService.handleProfileError(conflictError, mockUser);
      
      expect(result).toEqual({
        success: true,
        route: NAVIGATION_ROUTES.TRAVEL_STYLE,
        type: 'incomplete_profile',
        userData: mockIncompleteProfile
      });
    });

    it('should handle conflict when getUserProfile returns null', async () => {
      const conflictError = {
        response: { status: API_STATUS.CONFLICT }
      } as AxiosError;
      
      // Mock getUserProfile to return null
      jest.spyOn(authService, 'getUserProfile').mockResolvedValue(null);
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      await expect(authService.handleProfileError(conflictError, mockUser))
        .rejects.toThrow('Failed to handle existing user profile');
    });

    it('should handle conflict when getUserProfile throws error', async () => {
      const conflictError = {
        response: { status: API_STATUS.CONFLICT }
      } as AxiosError;
      
      // Mock getUserProfile to throw error
      jest.spyOn(authService, 'getUserProfile').mockRejectedValue(new Error('Profile fetch failed'));
      mockedAsyncStorage.setItem.mockResolvedValue(undefined);

      await expect(authService.handleProfileError(conflictError, mockUser))
        .rejects.toThrow('Failed to handle existing user profile');
    });

    it('should handle server errors (500+)', async () => {
      const serverError = {
        response: { status: 500 }
      } as AxiosError;
      
      await expect(authService.handleProfileError(serverError, mockUser))
        .rejects.toThrow('Server error - please try again later');
    });

    it('should handle server errors (502)', async () => {
      const serverError = {
        response: { status: 502 }
      } as AxiosError;
      
      await expect(authService.handleProfileError(serverError, mockUser))
        .rejects.toThrow('Server error - please try again later');
    });

    it('should re-throw unhandled errors', async () => {
      const customError = {
        response: { status: 403 }
      } as AxiosError;
      
      await expect(authService.handleProfileError(customError, mockUser))
        .rejects.toEqual(customError);
    });

    it('should re-throw original error for client errors', async () => {
      const clientError = {
        response: { status: 400 }
      } as AxiosError;
      
      await expect(authService.handleProfileError(clientError, mockUser))
        .rejects.toEqual(clientError);
    });
     });
});
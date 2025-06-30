import { axiosInstance } from '../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  GOOGLE_ID_TOKEN: 'googleIdToken',
  GOOGLE_ACCESS_TOKEN: 'googleAccessToken',
  USER_ID: 'userId',
};

export const API_STATUS = {
  SUCCESS: 201,
  CONFLICT: 409,
  BAD_REQUEST: 400,
};

export const NAVIGATION_ROUTES = {
  TRAVEL_STYLE: '/travel-style',
  FIND_TRIPS: '/findTrips',
};

class UserService {
  static async storeUserTokens(user, googleAccessToken) {
    try {
      const promises = [AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid)];
      
      if (googleAccessToken) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN, googleAccessToken));
      }

      const idToken = await user.getIdToken();
      if (idToken) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_ID_TOKEN, idToken));
      }

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Failed to store user tokens:', error);
      return false;
    }
  }

  static async clearStoredTokens() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.GOOGLE_ID_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_ID),
      ]);
      return true;
    } catch (error) {
      console.warn('Failed to clear stored tokens:', error);
      return false;
    }
  }

  static async createUserProfile(user) {
    const profileData = {
      userId: user.uid,
      profileImageUrl: "N/A",
      idCardImageUrl: "N/A",
      portraitImageUrl: "N/A",
      travelStyles: ["N/A"],
      nickname: "N/A",
      lineId: "N/A",
      fullname: user.displayName || "N/A",
      facebookUrl: "N/A",
      email: user.email || "N/A",
      destinations: ["N/A"],
      age: -999,
      phoneNumber: "N/A",
      gender: "ชาย",
    };

    try {
      const response = await axiosInstance.post('/users/profile', profileData, {
        timeout: 10000,
      });

      if (response.status === API_STATUS.SUCCESS) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, response.data.data.userId);
        return { 
          success: true, 
          route: NAVIGATION_ROUTES.TRAVEL_STYLE, 
          type: 'new_user' 
        };
      }
    } catch (error) {
      return this.handleProfileError(error, user);
    }
  }

  static async handleProfileError(error, user) {
    if (error.response?.status === API_STATUS.CONFLICT) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid);
      return { 
        success: true, 
        route: NAVIGATION_ROUTES.FIND_TRIPS, 
        type: 'existing_user' 
      };
    }

    if (error.response?.status === API_STATUS.BAD_REQUEST) {
      try {
        const response = await axiosInstance.get(`/users/profile/${user.uid}`);
        const isProfileComplete = response.data.data.age !== -999;
        
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid);
        
        return {
          success: true,
          route: isProfileComplete ? NAVIGATION_ROUTES.FIND_TRIPS : NAVIGATION_ROUTES.TRAVEL_STYLE,
          type: isProfileComplete ? 'complete_profile' : 'incomplete_profile'
        };
      } catch {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid);
        return {
          success: true,
          route: NAVIGATION_ROUTES.TRAVEL_STYLE,
          type: 'incomplete_profile'
        };
      }
    }

    throw error;
  }

  static async getUserProfile(userId) {
    try {
      const response = await axiosInstance.get(`/users/profile/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }
}

export default UserService;
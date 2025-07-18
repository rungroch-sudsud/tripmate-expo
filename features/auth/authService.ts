
import {AxiosError} from 'axios'
import {STORAGE_KEYS,API_STATUS,NAVIGATION_ROUTES} from '../../shared/constants/keysAndRoutes'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from 'firebase/auth'
import {axiosInstance} from '../../lib/axios'


export const storeUserTokens = async (user: User, googleAccessToken?:string) => {
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
};

export const clearStoredTokens = async () => {
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
};

export const getUserProfile = async (userId: string): Promise<any | null> => {
  try {
    const response = await axiosInstance.get(`/users/profile/${userId}`);
    
    if (response.status === 200) {
      return response.data.data;
    }
    
    return null;
  } catch (error: any) {
    // Handle different error cases
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      if (status === 404) {
        // User profile not found - this is expected behavior
        console.log(`User profile not found for userId: ${userId}`);
        return null;
      } else if (status === 500) {
        // Internal server error
        console.error('Internal server error while fetching user profile:', error.response.data);
        return null;
      } else {
        // Other HTTP errors
        console.error(`HTTP error ${status} while fetching user profile:`, error.response.data);
        return null;
      }
    } else if (error.request) {
      // Network error - no response received
      console.error('Network error while fetching user profile:', error.message);
      return null;
    } else {
      // Other errors
      console.error('Error fetching user profile:', error.message);
      return null;
    }
  }
};
export const handleProfileError = async (error: unknown, user: User) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  
  // Handle network errors
  if (!axiosError.response) {
    throw new Error('Network error - please check your connection');
  }

  // Handle conflict (user already exists)
  if (axiosError.response?.status === API_STATUS.BAD_REQUEST) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid);
      const response = await getUserProfile(user.uid);
      
      if (!response) {
        throw new Error('Failed to retrieve existing user profile');
      }

      // Check if profile is complete
      const isProfileComplete = response.age !== -999;
      
      return {
        success: true,
        route: isProfileComplete 
          ? NAVIGATION_ROUTES.FIND_TRIPS 
          : NAVIGATION_ROUTES.TRAVEL_STYLE,
        type: isProfileComplete ? 'existing_user' : 'incomplete_profile',
        userData: response
      };
    } catch (profileError) {
      throw new Error('Failed to handle existing user profile');
    }
  }

  // Handle other HTTP errors
  if (axiosError.response?.status >= 500) {
    throw new Error('Server error - please try again later');
  }

  // Re-throw original error for unhandled cases
  throw error;
};

// Enhanced profile creation with better validation
export const createUserProfile = async (user: User) => {
  // Validate required user data
  if (!user.uid) {
    throw new Error('User ID is required');
  }

  const profileData = {
    userId: user.uid,
    profileImageUrl: "N/A",
    idCardImageUrl: "N/A", 
    occupation:'',
    portraitImageUrl: "N/A",
    travelStyles: ["N/A"],
    nickname: "N/A",
    lineId: "N/A",
    fullname: user.displayName || "N/A",
    facebookUrl: "N/A",
    email: user.email || "N/A",
    destinations: ["N/A"],
    age: -999, // Sentinel value for incomplete profile
    phoneNumber: "N/A",
    gender: "ชาย",
    transportationStyles:[],
    travelPersonalities:[]
  };

  try {
    const response = await axiosInstance.post('/users/profile', profileData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status === API_STATUS.SUCCESS) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, response.data.data.userId);
      return {
        success: true,
        route: NAVIGATION_ROUTES.TRAVEL_STYLE,
        type: 'new_user',
        userData: response.data.data
      };
    }
    
    // Handle unexpected success status
    throw new Error(`Unexpected response status: ${response.status}`);
    
  } catch (error) {
    return handleProfileError(error, user);
  }
};


import { axiosInstance } from '../../../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { getAuth, signOut } from 'firebase/auth';
import {User} from 'firebase/auth'
import { AxiosError } from 'axios';
export const STORAGE_KEYS = {
  GOOGLE_ID_TOKEN: 'googleIdToken',
  GOOGLE_ACCESS_TOKEN: 'googleAccessToken',
  USER_ID: 'userId',
};

export const API_STATUS = {
  SUCCESS: 201,
  CONFLICT: 400,
  BAD_REQUEST: 400,
};

export const NAVIGATION_ROUTES = {
  TRAVEL_STYLE: '/travel-style',
  FIND_TRIPS: '/findTrips',
  PROFILE: '/profile',
};

// Validation utilities
export const VALIDATION_ERRORS = {
 
  FULL_NAME_REQUIRED: 'กรุณากรอกชื่อ-นามสกุล',
  FULL_NAME_SPECIAL_CHARS: 'ชื่อ-namสกุลไม่สามารถมีอักขระพิเศษได้',
  FULL_NAME_MULTIPLE_SPACES: 'ชื่อ-นามสกุลไม่สามารถมีช่องว่างมากกว่า 1 ช่องได้',
  FULL_NAME_FORMAT: 'กรุณากรอกชื่อและนามสกุล คั่นด้วยช่องว่าง 1 ช่อง',
  FULL_NAME_INCOMPLETE: 'กรุณากรอกชื่อและนามสกุลให้ครบถ้วน',
  EMAIL_INVALID: 'กรุณากรอกอีเมลที่ถูกต้อง',
  PHONE_INVALID: 'กรุณากรอกหมายเลขโทรศัพท์ที่ถูกต้อง (10 หลัก)',
  ID_CARD_REQUIRED: 'กรุณาอัพโหลดรูปบัตรประชาชน',
  SELFIE_REQUIRED: 'กรุณาอัพโหลดภาพถ่ายยืนยันตัวตน',
  NICKNAME_REQUIRED: 'กรุณากรอกชื่อเล่น',
  NICKNAME_INVALID: 'ชื่อเล่นไม่สามารถมีอักขระพิเศษได้',
  AGE_REQUIRED: 'กรุณากรอกอายุ',
  AGE_INVALID: 'อายุต้องเป็นตัวเลข 18-120 ปี',
  GENDER_REQUIRED: 'กรุณาเลือกเพศ',
  FACEBOOK_INVALID: 'กรุณากรอก Facebook URL หรือ Username ที่ถูกต้อง',
  LINE_INVALID: 'กรุณากรอก LINE ID ที่ถูกต้อง',
  OCCUPATION_INVALID:"Occupation cannot be null"
};

export const VALIDATION_REGEX = {
  EMAIL: /\S+@\S+\.\S+/,
  PHONE: /^[0-9]{10}$/,
  SPECIAL_CHARS: /[^a-zA-Zก-๙\s]/,
  FACEBOOK_URL: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/[a-zA-Z0-9.]+$/,
  LINE_ID: /^[a-zA-Z0-9._-]+$/,
};

// Authentication and Storage functions
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

// Profile management functions
export const handleProfileError = async (error: unknown, user: User) => {
  const axiosError = error as AxiosError<{ message?: string }>;

  if (axiosError.response?.status === API_STATUS.CONFLICT) {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid);
    const response = await getUserProfile(user.uid);

    if (response) {
      if (response.age !== -999) {
        return {
          success: true,
          route: NAVIGATION_ROUTES.FIND_TRIPS,
          type: 'existing_user',
        };
      } else if (response.age === -999) {
        return {
          success: true,
          route: NAVIGATION_ROUTES.TRAVEL_STYLE,
          type: 'incomplete_profile',
        };
      }
    }
  }

  throw error;
};

export const createUserProfile = async (user: User) => {
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
    return handleProfileError(error, user);
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

export const fetchUserProfile = async () => {
  try {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      console.error('No user ID found in storage');
      return null;
    }
    
    const response = await axiosInstance.get(`/users/profile/${userId}`);
    console.log('User profile fetched:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      throw new Error('No user ID found');
    }
    
    const response = await axiosInstance.patch(`/users/profile/${userId}`, profileData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error };
  }
};

// Data fetching functions
export const fetchDestinations = async () => {
  try {
    const response = await axiosInstance.get('/destinations');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch destinations:', error);
    return [];
  }
};

export const fetchTravelStyles = async () => {
  try {
    const response = await axiosInstance.get('/travel-styles');
    const result = response.data;
    
    const mappedCategories = result.data.map(item => ({
      id: item.id,
      title: item.title,
      iconImageUrl: item.iconImageUrl,
      activeIconImageUrl: item.activeIconImageUrl || item.iconImageUrl,
    }));
    
    return mappedCategories;
  } catch (error) {
    console.error('Failed to fetch travel styles:', error);
    return [];
  }
};



export const travelPersonalities=async()=>{
  try{
   const response=await axiosInstance.get('/travel-personalities');
      const result=response.data
      const mappedInterest=result.data.map(item=>({
        id:item.id,
        title:item.title
      }))
      return mappedInterest
  }catch{
   console.error("Failed to fetch travel interest: ",error); 
  }
}
export const transportationStyles = async () => {
  try {
    const response = await axiosInstance.get('/transportation-styles');
    const result = response.data;
    const mappedInterest = result.data.map(item => ({
      id: item.id,
      title: item.title
    }));
    return mappedInterest;
  } catch (error) { // Add 'error' parameter here
    console.error("Failed to fetch transportation styles: ", error);
    return []; // Return empty array on error
  }
};

export const fetTravelInterest=async()=>{
  try{
      const response=await axiosInstance.get('/travel-styles');
      const result=response.data
      const mappedInterest=result.data.map(item=>({
        id:item.id,
        title:item.title
      }))
      return mappedInterest
  }catch(error){
     console.error("Failed to fetch travel interest: ",error);
     
  }
}

// Image handling functions
export const pickImageFromLibrary = (options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      presentationStyle: 'overFullScreen',
      ...options,
    };

    launchImageLibrary(defaultOptions, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        resolve(null);
        return;
      }

      if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        reject(new Error(response.errorMessage));
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const pickedImage = response.assets[0];
        
        // Handle base64 data
        if (pickedImage.uri && pickedImage.uri.startsWith('data:')) {
          console.log('🟡 Base64 data detected, converting...');
          const convertedFile = convertBase64ToFile(
            pickedImage.uri,
            pickedImage.fileName ?? `image-${Date.now()}.jpg`,
            pickedImage.type ?? 'image/jpeg'
          );
          
          resolve({
            uri: convertedFile.uri,
            type: convertedFile.type,
            name: convertedFile.name,
            base64Data: convertedFile.base64Data,
            isBase64: true,
          });
          return;
        }

        if (!pickedImage.uri) {
          reject(new Error('No image URI received'));
          return;
        }

        resolve({
          uri: pickedImage.uri,
          type: pickedImage.type ?? 'image/jpeg',
          name: pickedImage.fileName ?? `image-${Date.now()}.jpg`,
          size: pickedImage.fileSize,
        });
      } else {
        reject(new Error('No image selected'));
      }
    });
  });
};

// Image upload functions
export const uploadImageToEndpoint = async (imageFile, endpoint) => {
  try {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      throw new Error('No user ID found');
    }
    
    const formData = new FormData();
    
    if (imageFile.isBase64 && imageFile.base64Data) {
      // Convert base64 to Blob for FormData
      const byteCharacters = atob(imageFile.base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: imageFile.type });
      formData.append('file', blob, imageFile.name);
    } else {
      const fileObj = {
        uri: imageFile.uri,
        type: imageFile.type,
        name: imageFile.name,
      };
      formData.append('file', fileObj);
    }

    const response = await axiosInstance.patch(`${endpoint}/${userId}`, formData, {

    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error uploading to ${endpoint}:`, error);
    return { success: false, error };
  }
};

export const uploadProfileImage = async (imageFile) => {
  return uploadImageToEndpoint(imageFile, '/users/profile/image');
};

export const uploadIdCardImage = async (imageFile) => {
  try {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      throw new Error('No user ID found');
    }

    const formData = new FormData();
    
    // Create file object for React Native
    const fileObj = {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.name || `id-card-${Date.now()}.jpg`,
    };

    formData.append('file', fileObj);

    console.log('Uploading ID card for user:', userId);
    console.log('File object:', fileObj);

    const response = await axiosInstance.patch(
      `/users/profile/id-card/image/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    console.log('ID card upload response:', response.data);
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error('ID card upload error:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

export const uploadPortraitImage = async (imageFile) => {
  try {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      throw new Error('No user ID found');
    }

    const formData = new FormData();
    
    // Create file object for React Native
    const fileObj = {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.name || `portrait-${Date.now()}.jpg`,
    };

    formData.append('file', fileObj);

    console.log('Uploading portrait for user:', userId);
    console.log('File object:', fileObj);

    const response = await axiosInstance.patch(
      `/users/profile/portrait/image/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    console.log('Portrait upload response:', response.data);
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error('Portrait upload error:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

// Authentication functions
export const handleLogout = async () => {
  try {
    const auth = getAuth();
    await signOut(auth);
    console.log('User logged out successfully');

    await AsyncStorage.multiRemove([
      STORAGE_KEYS.GOOGLE_ID_TOKEN,
      STORAGE_KEYS.GOOGLE_ACCESS_TOKEN,
      STORAGE_KEYS.USER_ID
    ]);
    
    return { success: true };
  } catch (error) {
    console.error('Logout failed:', error);
    return { success: false, error };
  }
};

// Enhanced validation functions
export const validateFullName = (name) => {
  if (!name || !name.trim()) {
    return VALIDATION_ERRORS.FULL_NAME_REQUIRED;
  }

  if (VALIDATION_REGEX.SPECIAL_CHARS.test(name)) {
    return VALIDATION_ERRORS.FULL_NAME_SPECIAL_CHARS;
  }

  if (name.includes('  ')) {
    return VALIDATION_ERRORS.FULL_NAME_MULTIPLE_SPACES;
  }

  const parts = name.trim().split(' ');
  if (parts.length !== 2) {
    return VALIDATION_ERRORS.FULL_NAME_FORMAT;
  }

  if (parts[0].length === 0 || parts[1].length === 0) {
    return VALIDATION_ERRORS.FULL_NAME_INCOMPLETE;
  }

  return null;
};

export const validateOccupation = (occupation) => {
  if (!occupation || !occupation.trim()) {
    return VALIDATION_ERRORS.OCCUPATION_INVALID;
  }

  return null;
};
export const validateNickname = (nickname) => {
  if (!nickname || !nickname.trim()) {
    return VALIDATION_ERRORS.NICKNAME_REQUIRED;
  }

  if (VALIDATION_REGEX.SPECIAL_CHARS.test(nickname)) {
    return VALIDATION_ERRORS.NICKNAME_INVALID;
  }

  return null;
};

export const validateAge = (age) => {
  if (!age || !age.trim()) {
    return VALIDATION_ERRORS.AGE_REQUIRED;
  }

  const ageNumber = parseInt(age, 10);
  if (isNaN(ageNumber) || ageNumber < 18 || ageNumber > 120) {
    return VALIDATION_ERRORS.AGE_INVALID;
  }

  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return VALIDATION_ERRORS.EMAIL_INVALID;
  }

  if (!VALIDATION_REGEX.EMAIL.test(email)) {
    return VALIDATION_ERRORS.EMAIL_INVALID;
  }
  
  return null;
};

export const validateFacebookUrl = (url) => {
  if (!url || !url.trim()) {
    return null; // Optional field
  }

  if (!VALIDATION_REGEX.FACEBOOK_URL.test(url)) {
    return VALIDATION_ERRORS.FACEBOOK_INVALID;
  }

  return null;
};

export const validateLineId = (lineId) => {
  if (!lineId || !lineId.trim()) {
    return null; // Optional field
  }

  if (!VALIDATION_REGEX.LINE_ID.test(lineId)) {
    return VALIDATION_ERRORS.LINE_INVALID;
  }

  return null;
};

export const validatePhoneNumber = (phone) => {
  if (!VALIDATION_REGEX.PHONE.test(phone)) {
    return VALIDATION_ERRORS.PHONE_INVALID;
  }
  return null;
};

export const validateProfileForm = (formData) => {
  const errors = {};

  const fullNameError = validateFullName(formData.fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const nicknameError = validateNickname(formData.nickname);
  if (nicknameError) errors.nickname = nicknameError;

  const ageError = validateAge(formData.age);
  if (ageError) errors.age = ageError;

  if (!formData.gender) {
    errors.gender = VALIDATION_ERRORS.GENDER_REQUIRED;
  }

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const facebookError = validateFacebookUrl(formData.facebookUrl);
  if (facebookError) errors.facebookUrl = facebookError;

  const lineError = validateLineId(formData.lineId);
  if (lineError) errors.lineId = lineError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateVerificationForm = (formData) => {
  const errors = {};

  const fullNameError = validateFullName(formData.fullName);
  if (fullNameError) {
    errors.fullName = fullNameError;
  }

  const phoneError = validatePhoneNumber(formData.phoneNumber);
  if (phoneError) {
    errors.phoneNumber = phoneError;
  }

  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }

  if (!formData.idCard) {
    errors.idCard = VALIDATION_ERRORS.ID_CARD_REQUIRED;
  }

  if (!formData.selfie) {
    errors.selfie = VALIDATION_ERRORS.SELFIE_REQUIRED;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Image processing utilities
export const convertBase64ToFile = (base64Uri, filename, mimeType) => {
  const base64Data = base64Uri.split(',')[1];
  return {
    uri: base64Uri,
    base64Data: base64Data,
    type: mimeType,
    name: filename,
    isBase64: true,
  };
};

export const processImagePickerResponse = (response, defaultName = 'image') => {
  if (response.didCancel || response.errorMessage) {
    console.log('Image picker cancelled or error:', response.errorMessage);
    return null;
  }

  if (response.assets && response.assets.length > 0) {
    const pickedImage = response.assets[0];
    
    const processedImage = {
      uri: pickedImage.uri,
      type: pickedImage.type || 'image/jpeg',
      name: pickedImage.fileName || `${defaultName}-${Date.now()}.jpg`,
      size: pickedImage.fileSize,
    };
    
    console.log('Processed image:', processedImage);
    return processedImage;
  }

  return null;
};

// Profile data processing
export const processUserProfileData = (user, categories) => {
  const sanitizeValue = (value) => {
    if (value === null || value === undefined || value === 'N/A') {
      return '';
    }
    return value.toString();
  };

  const formData = {
    fullName: sanitizeValue(user.fullname),
    nickname: sanitizeValue(user.nickname),
    email: sanitizeValue(user.email),
    age: user.age !== -999 ? user.age.toString() : '',
    gender: sanitizeValue(user.gender),
    customGender: '',
    facebookUrl: sanitizeValue(user.facebookUrl),
    lineId: sanitizeValue(user.lineId),
    travelInterests: [],
    favouriteDestinations: user.destinations?.filter(dest => dest !== "N/A") || [],
    travelStyles: user.travelStyles || [],
  };

  const selectedDestinations = user.destinations?.filter(dest => dest !== "N/A") || [];
  
  let selectedTravelStyles = [];
  if (user.travelStyles && Array.isArray(user.travelStyles)) {
    selectedTravelStyles = user.travelStyles.filter(styleId => 
      categories.some(cat => cat.id === styleId)
    );
    
    if (selectedTravelStyles.length === 0 && categories.length > 0) {
      selectedTravelStyles = user.travelStyles
        .map(styleName => categories.find(cat => cat.title === styleName)?.id)
        .filter(Boolean);
    }
  }

  return {
    formData,
    selectedDestinations,
    selectedTravelStyles,
  };
};

// Complete profile submission
export const submitProfileForm = async (formData, selectedDestinations, selectedTravelStyles, imageFile) => {
  try {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      throw new Error('No user ID found');
    }

    const profileData = {
      fullname: formData.fullName,
      nickname: formData.nickname,
      email: formData.email,
      gender: formData.gender,
      age: Number(formData.age),
      travelStyles: selectedTravelStyles,
      destinations: Array.from(new Set(selectedDestinations)),
      lineId: formData.lineId || '',
      facebookUrl: formData.facebookUrl || '',
    };

    console.log('Submitting profile data:', profileData);

    const profileResponse = await axiosInstance.patch(
      `/users/profile/${userId}`,
      profileData,
      {
        headers: {
          "Content-Type": 'application/json'
        }
      }
    );

    console.log("Profile updated successfully:", profileResponse.data);

    // Upload image if provided
    if (imageFile) {
      const imageResult = await uploadProfileImage(imageFile);
      if (!imageResult.success) {
        console.error("Image upload failed:", imageResult.error);
        // Continue anyway, profile was updated successfully
      }
    }

    return { success: true, data: profileResponse.data };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error };
  }
};

// Keep the class export for backward compatibility
class UserService {
  static storeUserTokens = storeUserTokens;
  static clearStoredTokens = clearStoredTokens;
  static createUserProfile = createUserProfile;
  static handleProfileError = handleProfileError;
  static getUserProfile = getUserProfile;
  static fetchUserProfile = fetchUserProfile;
  static updateUserProfile = updateUserProfile;
  static fetchDestinations = fetchDestinations;
  static fetchTravelStyles = fetchTravelStyles;
  static pickImageFromLibrary = pickImageFromLibrary;
  static uploadImageToEndpoint = uploadImageToEndpoint;
  static uploadProfileImage = uploadProfileImage;
  static uploadIdCardImage = uploadIdCardImage;
  static uploadPortraitImage = uploadPortraitImage;
  static handleLogout = handleLogout;
  static validateFullName = validateFullName;
  static validateNickname = validateNickname;
  static validateAge = validateAge;
  static validateEmail = validateEmail;
  static validateFacebookUrl = validateFacebookUrl;
  static validateLineId = validateLineId;
  static validatePhoneNumber = validatePhoneNumber;
  static validateProfileForm = validateProfileForm;
  static validateVerificationForm = validateVerificationForm;
  static convertBase64ToFile = convertBase64ToFile;
  static processImagePickerResponse = processImagePickerResponse;
  static processUserProfileData = processUserProfileData;
  static submitProfileForm = submitProfileForm;
}

export default UserService;
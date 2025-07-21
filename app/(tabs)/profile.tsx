import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { DestinationsComponent } from '../../components/Edit_CreateTrip_jsx';
import { Dropdown } from 'react-native-element-dropdown';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { axiosInstance } from '../../lib/axios';
import axios from 'axios';
import { getAuth, signOut } from 'firebase/auth';
import styles from '../../css/profile_styles';
import ProgressBar from '../../components/ProgressBar';
import { Category, ApiResponse } from '../../shared/schemas/api.schema';
import { User } from '../../shared/schemas/user_schema';
import { ValidationErrors } from '../../shared/schemas/errors_schema';
import { ProfileFormData } from '../../shared/schemas/form_schema';
import { PickedFile } from '@/shared/schemas/file_type';
import {
  validateAge,
  validateEmail,
  validateFacebookUrl,
  validateFullName,
  validateNickname,
  validateLineId,
  fetchTravelStyles,
  validateOccupation,
  travelPersonalities,
  transportationStyles
} from '../../features/user/services/userServices';
import { sanitizeValue } from '../../shared/utils/sanitizeValue';
import { convertBase64ToFile } from '../../shared/utils/file.util';
import { TravelStylesComponent } from '../../components/Edit_CreateTrip_jsx';

interface ImageWithText {
  id: string;
  uri: string;
  type: string;
  name: string;
  text: string;
}

interface OriginalData {
  formData: ProfileFormData;
  selectedDestinations: string[];
  selectedTravelStyles: string[];
}

const ProfileForm: React.FC = () => {
  // Form data state
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    nickname: '',
    occupation: '',
    age: '',
    gender: '',
    customGender: '',
    email: '',
    facebookUrl: '',
    lineId: '',
    travelInterests: [],
    favouriteDestinations: [],
    travelStyles: [],
  });

  // Image states
  const [imageFile, setImageFile] = useState<PickedFile | null>(null);
  const [imageTextArray, setImageTextArray] = useState<ImageWithText[]>([]);

  // Travel preferences
  const [selectedTravel, setSelectedTravel] = useState<Category[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<Category[]>([]);
  const [selectedTravelIds, setSelectedTravelIds] = useState<string[]>([]);
  const [selectedTransportIds, setSelectedTransportIds] = useState<string[]>([]);

  // Destinations
  const [destinations, setDestinations] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [destinationError, setDestinationError] = useState<string | null>(null);

  // Travel styles
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  
  // User and validation
  const [user, setUser] = useState<User | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Original data for reset functionality
  const [originalData, setOriginalData] = useState<OriginalData>({
    formData: {
      fullName: '',
      nickname: '',
      occupation: '',
      age: '',
      gender: '',
      customGender: '',
      email: '',
      facebookUrl: '',
      lineId: '',
      travelInterests: [],
      favouriteDestinations: [],
      travelStyles: [],
    },
    selectedDestinations: [],
    selectedTravelStyles: [],
  });

  const params = useLocalSearchParams();
  const userId = params.userId;
  const progressAnimation = useRef(new Animated.Value(66.66)).current;
  const isResetting = useRef(false);

  const genderOptions = ['ผู้ชาย', 'ผู้หญิง', 'อื่นๆ'] as const;

  // Validation
const validateForm = (): boolean => {
  const newErrors: ValidationErrors = {};

  const fullNameError = validateFullName(formData.fullName);
  if (fullNameError) newErrors.fullName = fullNameError;

  const nicknameError = validateNickname(formData.nickname);
  if (nicknameError) newErrors.nickname = nicknameError;

  const ageError = validateAge(formData.age);
  if (ageError) newErrors.age = ageError;

  if (!formData.gender) {
    newErrors.gender = 'กรุณาเลือกเพศ';
  }

  const emailError = validateEmail(formData.email);
  if (emailError) newErrors.email = emailError;

  const facebookError = validateFacebookUrl(formData.facebookUrl);
  if (facebookError) newErrors.facebookUrl = facebookError;

  const lineError = validateLineId(formData.lineId);
  if (lineError) newErrors.lineId = lineError;

  const occupationError = validateOccupation(formData.occupation);
  if (occupationError) newErrors.occupation = occupationError;

  // ✅ Add travelStyles validation directly into newErrors
  if (selectedItems.length === 0) {
    newErrors.travelStyles = "กรุณาเลือกอย่างน้อย 1 กิจกรรม";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};


  // API functions
  const fetchUserProfile = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axiosInstance.get(`/users/profile/${userId}`);
      console.log('User profile fetched:', response.data.data);
      setUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Animate progress
      setTimeout(() => {
        Animated.timing(progressAnimation, {
          toValue: 100,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }, 300);

      // Fetch all required data in parallel
      const [
        destinationsResponse,
        travelStylesResponse,
        travelPersonalitiesResponse,
        transportationResponse
      ] = await Promise.all([
        axiosInstance.get('/destinations'),
        axiosInstance.get('/travel-styles'),
        travelPersonalities(),
        transportationStyles()
      ]);

      // Set destinations
      setDestinations(destinationsResponse.data.data || []);

      // Set travel styles
      const result: ApiResponse = travelStylesResponse.data;
      const mappedCategories: Category[] = result.data.map(item => ({
        id: item.id,
        title: item.title,
        iconImageUrl: item.iconImageUrl,
        activeIconImageUrl: item.activeIconImageUrl || item.iconImageUrl,
      }));
      setCategories(mappedCategories);
      setSelectedTravel(travelPersonalitiesResponse || []);
      setSelectedTransport(transportationResponse || []);

      console.log('Initial data loaded successfully');
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setDestinations([]);
      setCategories([]);
      setSelectedTravel([]);
      setSelectedTransport([]);
      Alert.alert('Error', 'Failed to load initial data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [progressAnimation]);

  // Event handlers
  const updateFormField = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear related error if it exists
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleSelection = (id: string): void => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleTravelPersonalityToggle = (id: string) => {
    setSelectedTravelIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleTransportToggle = (id: string) => {
    setSelectedTransportIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const addDestination = (dest: string) => {
    if (!selected.includes(dest)) {
      setSelected(prev => [...prev, dest]);
    }
    setDropdownOpen(false);
    setSearchText('');
  };

  const removeDestination = (dest: string) => {
    setSelected(prev => prev.filter(d => d !== dest));
  };

  const clearError = () => {
    setDestinationError(null);
  };

  const handleBack = (): void => {
    console.log("Resetting form to original values...");
    
    isResetting.current = true;
    
    // Reset to original data
    setFormData({ ...originalData.formData });
    setSelected([...originalData.selectedDestinations]);
    setSelectedItems([...originalData.selectedTravelStyles]);
    
    // Reset other form states
    setErrors({});
    setImageFile(null);
    setResponseMessage(null);
    setDropdownOpen(false);
    setSearchText('');
    setShowGenderDropdown(false);
    
    console.log("Form reset completed");
    
    setTimeout(() => {
      isResetting.current = false;
    }, 100);
    
    if (userId) {
      router.push('/(tabs)/findTrips');
    } else {
      router.push('/(tabs)/account-verification');
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      console.log('User logged out successfully');

      await AsyncStorage.multiRemove(['googleIdToken', 'googleAccessToken', 'userId']);
      
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Image handling
  const pickImage = useCallback(() => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      presentationStyle: 'overFullScreen' as const,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert('Error', response.errorMessage);
        }
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const pickedImage = response.assets[0];
        
        if (pickedImage.uri && pickedImage.uri.startsWith('data:')) {
          console.log('🟡 Base64 data detected, converting...');
          const convertedFile = convertBase64ToFile(
            pickedImage.uri,
            pickedImage.fileName ?? `id-card-${Date.now()}.jpg`,
            pickedImage.type ?? 'image/jpeg'
          );
          
          setImageFile({
            uri: convertedFile.uri,
            type: convertedFile.type,
            name: convertedFile.name,
            base64Data: convertedFile.base64Data,
            isBase64: true,
          } as any);

          console.log('🟢 Base64 image processed successfully');
          return;
        }

        if (!pickedImage.uri) {
          Alert.alert('Error', 'No image URI received. Please try again.');
          return;
        }

        setImageFile({
          uri: pickedImage.uri,
          type: pickedImage.type ?? 'image/jpeg',
          name: pickedImage.fileName ?? `id-card-${Date.now()}.jpg`,
          size: pickedImage.fileSize,
        });

        console.log('🟢 Image picked successfully');
      }
    });
  }, []);

  const pickImageWithText = useCallback(() => {
    const options = {
      mediaType: 'photo' as const,
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      storageOptions: {
        skipBackup: true,
        path: 'images'
      },
      presentationStyle: 'overFullScreen' as const,
    };
    
    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.errorMessage);
        }
        return;
      }

      const pickedImage = response.assets?.[0];
      if (!pickedImage?.uri) {
        console.log("No Image uri received, Please Try Again");
        return;
      }

      const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      
      const newImageItem: ImageWithText = {
        id: uniqueId,
        uri: pickedImage.uri,
        type: pickedImage.type ?? 'image/jpeg',
        name: pickedImage.fileName ?? `image-${Date.now()}.jpg`,
        text: '',
      };

      setImageTextArray(prev => [...prev, newImageItem]);
      
      console.log('Image added successfully with ID:', uniqueId);
    });
  }, []);

  const removeImageFromArray = useCallback((id: string) => {
    setImageTextArray(prev => prev.filter(item => item.id !== id));
    console.log('Image removed with ID:', id);
  }, []);

  const updateImageText = useCallback((id: string, newText: string) => {
    setImageTextArray(prev => 
      prev.map(item => 
        item.id === id ? { ...item, text: newText } : item
      )
    );
  }, []);

  const uploadImageWithFetch = async (): Promise<void> => {
    if (!imageFile) {
      setResponseMessage('No image selected to upload');
      return;
    }

    console.log('🟢 Starting FormData fetch upload...');

    const formData = new FormData();
    
    if (imageFile.isBase64 && imageFile.base64Data) {
      console.log('🟡 Converting base64 to Blob...');
      
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
      } as any;

      formData.append('file', fileObj);
    }

    setUploading(true);
    setResponseMessage(null);

    try {
      const userId = await AsyncStorage.getItem('userId');
      
      const response = await axiosInstance.patch(`/users/profile/image/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
      console.log('🔵 Axios response status:', response.status);
      console.log('🔵 Axios response data:', response.data);
    
      if (response.status === 200) {
        setResponseMessage(`Success: ${response.data.message || 'Upload completed'}`);
        Alert.alert('Success', 'ID Card uploaded successfully!');
      }
    } catch (error: any) {
      console.error('🔴 Upload error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        setResponseMessage(`Error (${error.response?.status}): ${message}`);
        Alert.alert('Upload Failed', `${message} (Status: ${error.response?.status})`);
      } else {
        setResponseMessage(`Error: ${error.message}`);
        Alert.alert('Upload Error', error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const uploadPastTripImages = async (): Promise<void> => {
    try {
      for (const imageItem of imageTextArray) {
        const formData = new FormData();
        
        const response = await fetch(imageItem.uri);
        const blob = await response.blob();
        
        formData.append('file', blob, imageItem.name);
        formData.append('description', imageItem.text || 'A sample file');

        const uploadResponse = await axiosInstance.post(
          '/users/past-trip-image',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        console.log(`Past trip image ${imageItem.id} uploaded successfully:`, uploadResponse.data);
      }
    } catch (error) {
      console.error('Error uploading past trip images:', error);
      throw error;
    }
  };

  const handleSubmit = async (): Promise<void> => {
    console.log(formData.gender);
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.log('No userId found');
      return;
    }

    try {
      const selectedStyleIds = selectedItems;
      const profileData = {
        fullname: formData.fullName,
        nickname: formData.nickname,
        occupation: formData.occupation,
        email: formData.email,
        gender: formData.gender,
        age: Number(formData.age),
        travelStyles: selectedStyleIds,
        destinations: Array.from(new Set(selected)),
        lineId: formData.lineId || '',
        facebookUrl: formData.facebookUrl || '',
        transportationStyles: selectedTransportIds
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

      if (imageFile) {
        await uploadImageWithFetch();
      }

      if (imageTextArray.length > 0) {
        await uploadPastTripImages();
      }

      router.push('/findTrips');
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  // Effects
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (isResetting.current) {
      console.log("Skipping useEffect due to reset in progress");
      return;
    }
    
    if (!user || categories.length === 0) return;

    console.log("Processing user data:", user);

    const newFormData: ProfileFormData = {
      fullName: sanitizeValue(user.fullname),
      nickname: sanitizeValue(user.nickname),
      email: sanitizeValue(user.email),
      occupation: sanitizeValue(user.occupation) || '',
      age: user.age !== -999 ? user.age.toString() : '',
      gender: '',
      customGender: '',
      facebookUrl: sanitizeValue(user.facebookUrl),
      lineId: sanitizeValue(user.lineId),
      travelInterests: [],
      favouriteDestinations: user.destinations?.filter(dest => dest !== "N/A") || [],
      travelStyles: user.travelStyles || [],
    };

    const newSelectedDestinations = user.destinations?.filter(dest => dest !== "N/A") || [];
    
    let newSelectedTravelStyles: string[] = [];
    if (user.travelStyles && Array.isArray(user.travelStyles)) {
      newSelectedTravelStyles = user.travelStyles.filter(styleId => 
        categories.some(cat => cat.id === styleId)
      );
      
      if (newSelectedTravelStyles.length === 0 && categories.length > 0) {
        newSelectedTravelStyles = user.travelStyles
          .map(styleName => categories.find(cat => cat.title === styleName)?.id)
          .filter(Boolean) as string[];
      }
    }

    const shouldUpdate = 
      originalData.formData.fullName === '' ||
      JSON.stringify(originalData.formData) !== JSON.stringify(newFormData) || 
      JSON.stringify(originalData.selectedDestinations) !== JSON.stringify(newSelectedDestinations) ||
      JSON.stringify(originalData.selectedTravelStyles) !== JSON.stringify(newSelectedTravelStyles);

    if (shouldUpdate) {
      setFormData(newFormData);
      setSelected(newSelectedDestinations);
      setSelectedItems(newSelectedTravelStyles);

      const originalDataSnapshot: OriginalData = {
        formData: { ...newFormData },
        selectedDestinations: [...newSelectedDestinations],
        selectedTravelStyles: [...newSelectedTravelStyles],
      };
      setOriginalData(originalDataSnapshot);

      console.log("Form data processed successfully");
    } else {
      console.log("Skipping form data update - no changes detected");
    }
  }, [user, categories]);

  // Helper functions
  const renderError = (error?: string) => {
    if (!error) return null;
    return (
      <Text style={{
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 20,
        marginBottom: 20,
        fontFamily: 'LineSeedSansTH_A_Bd',
        fontWeight: '700'
      }}>
        {error}
      </Text>
    );
  };

  const filteredDestinations = destinations.filter(dest =>
    dest.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderFormInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    error?: string,
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad',
    maxLength?: number
  ) => (
    <>
      <View style={[
        { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 15 },
        !error && { marginBottom: 20 }
      ]}>
        <Text style={{ fontFamily: 'LineSeedSansTH_A_Bd', fontWeight: '700', color: '#374151', fontSize: 10 }}>
          {label}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={{
            backgroundColor: '#F3F4F6',
            color: '#374151',
            outlineWidth: 0,
            paddingVertical: 2,
            fontFamily: 'LineSeedSansTH_A_Bd',
            fontSize: 13,
            fontWeight: '700'
          }}
          keyboardType={keyboardType}
          maxLength={maxLength}
          placeholderTextColor="#9CA3AF"
        />
      </View>
      {renderError(error)}
    </>
  );
 return (
  <SafeAreaView style={styles.container}>
    <Stack.Screen options={{ headerShown: false }} />
    
    {/* Header */}
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Image source={require('../assets/images/back.png')} style={{ height: 8, width: 14 }} />
      </TouchableOpacity>
      <Text style={styles.headerText}>สร้างโปรไฟล์</Text>
      {userId ? (
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ color: '#585DDB', fontFamily: 'LineSeedSansTH', fontSize: 14 }}>บันทึก</Text>
        </TouchableOpacity>
      ) : null}
    </View>

    {/* Progress Bar */}
    {!userId && (
      <ProgressBar animation={progressAnimation} styles={styles} />
    )}

    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Profile Picture */}
      <View style={[styles.profileSection]}>
        <TouchableOpacity 
          style={[styles.profileImageContainer]}
          onPress={pickImage}
        >
          <Image
            source={
              imageFile?.uri && imageFile.uri !== "" ? { uri: imageFile.uri } :  
              user?.profileImageUrl ? { uri: user.profileImageUrl } :
              { uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' }
            }
            style={[styles.profileImage, imageFile?.uri ? { borderWidth: 0 } : { borderColor: '#585DDB', borderWidth: 1 }]}
          />
          <View style={styles.cameraButton}>
            <Image
              source={require('../assets/images/images/images/image6.png')} 
              style={{ height: 16, width: 16 }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.formSection}>
        {/* Full Name */}
        {renderFormInput(
          'ชื่อ-นามสกุล',
          formData.fullName,
          (text) => updateFormField('fullName', text),
          'กรอกชื่อจริงและนามสกุลของคุณ',
          errors.fullName
        )}

        {/* Nickname */}
        {renderFormInput(
          'ชื่อเล่น',
          formData.nickname,
          (text) => updateFormField('nickname', text),
          'กรอกชื่อสำหรับแสดงในแอป',
          errors.nickname
        )}

        {/* Email */}
        {renderFormInput(
          'อีเมล',
          formData.email,
          (text) => updateFormField('email', text),
          'example@email.com',
          errors.email,
          'email-address'
        )}

        {/* Age and Gender Row */}
        <View style={[{ flexDirection: 'row', gap: 10 }, styles.inputGroup]}>
          {/* Age */}
          <View style={[{ flex: 1 }]}>
            <View style={{ backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
              <Text style={{ fontFamily: 'LineSeedSansTH_A_Bd', fontWeight: '700', color: '#374151', fontSize: 10 }}>อายุ</Text>
              <TextInput
                value={formData.age}
                style={[
                  errors.age && styles.inputError,
                  { backgroundColor: '#F3F4F6', color: '#374151', outlineWidth: 0, paddingVertical: 2, fontFamily: 'LineSeedSansTH_A_Bd', fontSize: 13, fontWeight: '700' }
                ]}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  let age = parseInt(numericText, 10);
                  if (!isNaN(age) && age > 120) {
                    age = 120;
                  }
                  updateFormField('age', isNaN(age) ? numericText : age.toString());
                }}
                keyboardType="numeric"
                placeholder="อายุของคุณ"
                placeholderTextColor="#9CA3AF"
                maxLength={3}
              />
            </View>
            {renderError(errors.age)}
          </View>

          {/* Gender Dropdown */}
          <View style={[{ flex: 1 }]}>
            <View style={{ backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
              <Text style={{ fontFamily: 'LineSeedSansTH_A_Bd', fontSize: 10, fontWeight: '700', color: '#374151', marginLeft: 20 }}>เพศ</Text>
              <Dropdown
                style={{
                  flex: 1,
                  backgroundColor: '#F3F4F6',
                  borderRadius: 10,
                  width: '100%',
                  marginTop: -5,
                  paddingHorizontal: 20,
                  paddingVertical: 5,
                }}
                placeholderStyle={{
                  color: '#9CA3AF',
                  fontFamily: 'LineSeedSansTH_A_Bd',
                  fontWeight: '700',
                  fontSize: 13
                }}
                selectedTextStyle={{
                  color: '#374151',
                  fontFamily: 'LineSeedSansTH_A_Bd',
                  fontWeight: '700',
                  fontSize: 13,
                  
                }}
                containerStyle={{
                  borderRadius: 10,
                  marginTop: 5,
                  backgroundColor:'#F3F4F6'
                }}
                itemTextStyle={{
                  fontFamily: 'LineSeedSansTH_A_Bd',
                  fontSize: 13,
                  fontWeight: '700',
                }}
                data={genderOptions.map(item => ({
                  label: item,
                  value: item
                }))}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="เลือกเพศ"
                value={formData.gender}
                onChange={item => {
                  updateFormField('gender', item.value);
                  updateFormField('customGender', '');
                }}
                renderRightIcon={() => (
                  <Image source={require('../assets/images/images/images/image10.png')} style={{ height: 7.22, width: 12.02, marginRight: -25 }} />
                )}
                disable={false}
                autoScroll={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
            {renderError(errors.gender)}
          </View>
        </View>

        {/* Occupation */}
        {renderFormInput(
          'อาชีพ',
          formData.occupation,
          (text) => updateFormField('occupation', text),
          'กรอกอาชีพของคุณ',
          errors.occupation
        )}

        {/* Additional Contacts */}
        <Text style={{ color: '#374151', fontFamily: 'LineSeedSansTH_A_Bd', fontWeight: '700', fontSize: 14, marginBottom: 20 }}>ช่องทางการติดต่อ</Text>
        
        {/* Facebook */}
        <View style={[
          { flexDirection: 'row', alignItems: 'center', outlineWidth: 0, backgroundColor: '#F3F4F6', borderRadius: 10 },
          !errors.facebookUrl && { marginBottom: 15 }
        ]}>
          <Image
            source={require('../assets/images/facebook.png')}
            style={{ height: 20, width: 20, marginLeft: 15 }}
            resizeMode="contain"
          />
          <TextInput
            style={[styles.socialInput, errors.facebookUrl && styles.inputError]}
            placeholder="Facebook URL หรือ Username"
            value={formData.facebookUrl}
            onChangeText={(text: string) => updateFormField('facebookUrl', text)}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
        </View>
        {renderError(errors.facebookUrl)}

        {/* LINE/Instagram */}
        <View style={[
          { flexDirection: 'row', alignItems: 'center', outlineWidth: 0, backgroundColor: '#F3F4F6', borderRadius: 10 },
          !errors.lineId && { marginBottom: 20 }
        ]}>
          <Image
            source={require('../assets/images/instagram.png')}
            style={{ height: 20, width: 20, marginLeft: 15 }}
            resizeMode="contain"
          />
          <TextInput
            style={[styles.socialInput, errors.lineId && styles.inputError]}
            placeholder="Instagram URL หรือ Username"
            value={formData.lineId}
            onChangeText={(text: string) => updateFormField('lineId', text)}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
        </View>
        {renderError(errors.lineId)}

        {/* Travel Interests Section */}
        <TravelStylesComponent
          categories={categories}
          selectedItems={selectedItems}
          onToggleSelection={toggleSelection}
          loading={loading}
          styles={styles}
          title="สไตล์เที่ยว"
          subtitle="เลือกกิจกรรมที่คุณสนใจ (เลือกได้หลายข้อ)"
          selectedColor="#6366f1"
          unselectedColor="#000"
          iconSize={{ width: 15.75, height: 14 }}
          isEditMode={false}
          highlightType="gradientcolor" 
          error={errors.travelStyles}
          clearError={()=>{
            setErrors((prev)=>({...prev,travelStyles:undefined}))
          }}
        />

        <View style={{ marginTop: 15, marginBottom: -20 }}>
          {/* Transportation Styles Section */}
          <TravelStylesComponent
            categories={selectedTransport}
            selectedItems={selectedTransportIds}
            onToggleSelection={handleTransportToggle}
            loading={loading}
            styles={styles}
            title="สไตล์การเดินทาง"
            subtitle="เป้าหมายท่องเที่ยว (เลือกได้หลายข้อ)"
            selectedColor="#6366f1"
            unselectedColor="#000"
            iconSize={{ width: 15.75, height: 14 }}
            isEditMode={false}
            highlightType="solidcolor1" 
          />
        </View>

        {/* Travel Personalities Section */}
        <View style={{ marginTop: 10 }}>
          <TravelStylesComponent
            categories={selectedTravel}
            selectedItems={selectedTravelIds}
            onToggleSelection={handleTravelPersonalityToggle}
            loading={loading}
            styles={styles}
            title="บุคลิกการเดินทาง"
            subtitle="เลือกสไตล์การเดินทางที่เหมาะกับคุณ"
            selectedColor="#6366f1"
            unselectedColor="#000"
            iconSize={{ width: 15.75, height: 14 }}
            isEditMode={false}
            highlightType="solidcolor2" 
          />
        </View>

        {/* Destinations Section */}
        <View style={{ backgroundColor: '#F3F4F6', borderRadius: 15, paddingTop: 10 }}>
          <Text style={[styles.title, { marginLeft: 22, fontFamily: 'LineSeedSansTH_A_Bd', color: "#374151" }]}>จุดหมายปลายทางที่อยากไป</Text>
          <Text style={[styles.subtitle, { margin: 22, marginTop: 10, fontFamily: 'LineSeedSansTH' }]}>เลือกสถานที่ที่คุณวางแผนจะไปเที่ยว</Text>

          <DestinationsComponent
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            searchText={searchText}
            setSearchText={setSearchText}
            filteredDestinations={filteredDestinations}
            selectedDestinations={selected}
            onAddDestination={addDestination}
            onRemoveDestination={removeDestination}
            loading={loading}
            error={destinationError}
            clearError={clearError}
            styles={styles}
            isEditMode={false}
          />
        </View>

        {/* Past Trip Images Section */}
        <View style={{ backgroundColor: '#F3F4F6', borderRadius: 15, paddingTop: 10, marginTop: 20 }}>
          <Text style={[{ marginLeft: 22, fontFamily: 'LineSeedSansTH_A_Bd', color: "#374151", fontSize: 13, marginBottom: 15 }]}>
            รูปภาพทริปที่เคยไป
          </Text>
          
          {/* Image Grid */}
          <View style={{ 
            paddingHorizontal: 22, 
            paddingBottom: 20,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}>
            {imageTextArray.map((item) => (
              <View key={item.id} style={{ 
                marginBottom: 15, 
                width: '48%' // Takes roughly half the width with some spacing
              }}>
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: item.uri }}
                    style={{
                      width: '100%',
                      height: 120,
                      borderRadius: 10,
                      backgroundColor: '#E5E7EB',
                      paddingHorizontal: 10
                    }}
                    resizeMode="cover"
                  />
                  
                  {/* Remove button */}
                  <TouchableOpacity
                    onPress={() => removeImageFromArray(item.id)}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: 'red',
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>×</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Text input for each image */}
                <TextInput
                  style={{
                    position: 'absolute',
                    top: 70,
                    outlineWidth: 0,
                    marginTop: 8,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingTop: 10,
                    fontSize: 12,
                    height: 35,
                    fontFamily: 'LineSeedSansTH',
                  }}
                  placeholder="เพิ่มคำอธิบายรูปภาพ"
                  placeholderTextColor='#9CA3AF'
                  value={item.text}
                  onChangeText={(text) => updateImageText(item.id, text)}
                  multiline
                  numberOfLines={2}
                />
              </View>
            ))}
            
            {/* Add new image button */}
            <TouchableOpacity
              onPress={pickImageWithText}
              style={{
                width: '48%',
                height: 120,
                borderRadius: 10,
                backgroundColor: '#FFFFFF',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <Text style={{ fontSize: 50, color: '#D1D5DB' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>

    {/* Submit Button */}
    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
      <Text style={styles.submitButtonText}>บันทึกและดำเนินการต่อ</Text>
      <Image
        source={require('../assets/images/images/images/image8.png')}
        style={{ height: 16, width: 16 }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  </SafeAreaView>
);

}


export default ProfileForm
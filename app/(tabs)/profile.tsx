import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { axiosInstance } from '../lib/axios';
import axios from 'axios';
import { getAuth, signOut } from 'firebase/auth';
import { useFonts } from 'expo-font';
import styles from './css/profile_styles';

// Type definitions
interface Category {
  id: string;
  title: string;
  iconImageUrl: string;
  activeIconImageUrl: string;
}

interface ApiResponse {
  data: {
    id: string;
    title: string;
    iconImageUrl: string;
    activeIconImageUrl: string;
  }[];
  message: string;
}

interface ProfileFormData {
  fullName: string;
  nickname: string;
  age: string;
  gender: string;
  customGender: string;
  email: string;
  facebookUrl: string;
  lineId: string;
  travelInterests: string[];
  favouriteDestinations: string[];
  travelStyles?: string[];
}

type PickedFile = {
  uri: string;
  type: string;
  name: string;
  size?: number;
  base64Data?: string;
  isBase64?: boolean;
};

interface ValidationErrors {
  fullName?: string;
  nickname?: string;
  age?: string;
  gender?: string;
  email?: string;
  facebookUrl?: string;
  lineId?: string;
}

interface User {
  fullname: string;
  nickname: string;
  email: string;
  age: number;
  gender: string;
  facebookUrl: string;
  lineId: string;
  destinations: string[];
  travelStyles: string[];
  profileImageUrl?: string;
}

const ProfileForm: React.FC = () => {
  // Font loading
  const [fontsLoaded] = useFonts({
    'CustomFont': require('../assets/fonts/InterTight-Black.ttf'),
    'InterTight-SemiBold': require('../assets/fonts/InterTight-SemiBold.ttf'),
    'InterTight-Regular': require('../assets/fonts/InterTight-Regular.ttf')
  });

  // State management
  const [imageFile, setImageFile] = useState<PickedFile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  // Destinations
  const [destinations, setDestinations] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Travel Styles
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Form data
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    nickname: '',
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

  // Other states
  const [loading, setLoading] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const params = useLocalSearchParams();
  const userId = params.userId;
  const progressAnimation = useRef(new Animated.Value(66.66)).current;

  const [originalData, setOriginalData] = useState<{
    formData: ProfileFormData;
    selectedDestinations: string[];
    selectedTravelStyles: string[];
  }>({
    formData: {
      fullName: '',
      nickname: '',
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

  const genderOptions = ['ผู้ชาย', 'ผู้หญิง', 'อื่นๆ'] as const;
  const isResetting = useRef(false);

  // Validation functions
  const validateFullName = (name: string): string | null => {
    const trimmedName = name.trim();
    
    if (name !== trimmedName) {
      return 'ชื่อ-นามสกุลห้ามมีช่องว่างก่อนและหลัง';
    }
    
    if (!trimmedName) {
      return 'กรุณากรอกชื่อ-นามสกุล';
    }
    
    const specialCharRegex = /[^a-zA-Zก-๙\s]/;
    if (specialCharRegex.test(trimmedName)) {
      return 'ชื่อ-นามสกุลไม่สามารถมีอักขระพิเศษได้';
    }
    
    if (trimmedName.includes('  ')) {
      return 'ชื่อ-นามสกุลไม่สามารถมีช่องว่างมากกว่า 1 ช่องได้';
    }
    
    const parts = trimmedName.split(' ');
    if (parts.length !== 2) {
      return 'กรุณากรอกชื่อและนามสกุล คั่นด้วยช่องว่าง 1 ช่อง';
    }
    
    if (parts[0].length === 0 || parts[1].length === 0) {
      return 'กรุณากรอกชื่อและนามสกุลให้ครบถ้วน';
    }
    
    return null;
  };

  const validateNickname = (name: string): string | null => {
    const trimmed = name.trim();
    
    if (!trimmed) {
      return 'กรุณากรอกชื่อเล่น';
    }
    
    if (name !== trimmed) {
      return 'ชื่อเล่นห้ามมีช่องว่างก่อนและหลัง';
    }
    
    if (trimmed.includes(' ')) {
      return 'ชื่อเล่นต้องเป็นคำเดียวโดยไม่มีช่องว่าง';
    }
    
    const specialCharRegex = /[^a-zA-Zก-๙]/;
    if (specialCharRegex.test(trimmed)) {
      return 'ชื่อเล่นสามารถประกอบด้วยตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น';
    }
    
    return null;
  };

  const validateAge = (age: string): string | null => {
    if (!age.trim()) {
      return 'กรุณากรอกอายุ';
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0) {
      return 'อายุต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0';
    }

    if (ageNum > 150) {
      return 'กรุณากรอกอายุที่ถูกต้อง';
    }

    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'กรุณากรอกอีเมล';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    return null;
  };

  const validateFacebookUrl = (url: string): string | undefined => {
    if (!url.trim()) return undefined;
    
    const facebookUrlRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+/i;
    const usernameRegex = /^[a-zA-Z0-9.]{5,}$/;
    
    if (facebookUrlRegex.test(url) || usernameRegex.test(url)) {
      return undefined;
    }
    
    return "กรุณาใส่ Facebook URL ที่ถูกต้อง หรือ Username";
  };

  const validateLineId = (lineId: string): string | undefined => {
    if (!lineId.trim()) return undefined;
    
    const lineIdRegex = /^[a-zA-Z0-9._-]{4,20}$/;
    
    if (lineIdRegex.test(lineId)) {
      return undefined;
    }
    
    return "LINE ID ต้องมี 4-20 ตัวอักษร และใช้ได้เฉพาะ a-z, 0-9, ., _, -";
  };

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Utility functions
  const sanitizeValue = (value: any): string => {
    if (value === "N/A" || value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  const convertBase64ToFile = (base64Uri: string, filename: string, mimeType: string) => {
    const base64Data = base64Uri.split(',')[1];
    return {
      uri: base64Uri,
      base64Data: base64Data,
      type: mimeType,
      name: filename,
      isBase64: true,
    };
  };

  // API functions
  const fetchUserProfile = useCallback(async () => {  
    try {
      const userId=await AsyncStorage.getItem('userId')
      const response = await axiosInstance.get(`/users/profile/${userId}`);
      console.log('User profile fetched:', response.data.data);
      setUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [userId]);

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

      // Fetch user ID from storage
      const storedID = await AsyncStorage.getItem('userId');
      console.log('User Id:', storedID);
      setEmail(storedID);

      // Fetch destinations and travel styles in parallel
      const [destinationsResponse, travelStylesResponse] = await Promise.all([
        axiosInstance.get('/destinations'),
        axiosInstance.get('/travel-styles')
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

      console.log('Initial data loaded successfully');
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setDestinations([]);
      setCategories([]);
      Alert.alert('Error', 'Failed to load initial data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [progressAnimation]);

  // Event handlers
  const toggleSelection = (id: string): void => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const addDestination = (dest: string) => {
    if (!selected.includes(dest)) {
      setSelected([...selected, dest]);
    }
    setDropdownOpen(false);
    setSearchText('');
  };

  const removeDestination = (dest: string) => {
    setSelected(selected.filter(d => d !== dest));
  };

  const handleBack = (): void => {
    console.log("Resetting form to original values...");
    
    // Set reset flag to prevent useEffect from interfering
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
    
    // Clear reset flag after a brief delay
    setTimeout(() => {
      isResetting.current = false;
    }, 100);
    
   if(userId){
    router.push('/(tabs)/findTrips');
   }else{
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

  const pickImage = () => {
    const options: any = {
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      presentationStyle: 'overFullScreen',
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', response.errorMessage);
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
  };

  const uploadImageWithFetch = async () => {
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

  const handleSubmit = async (): Promise<void> => {
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
        email: formData.email,
        gender: formData.gender,
        age: Number(formData.age),
        travelStyles: selectedStyleIds,
        destinations: Array.from(new Set(selected)),
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

      if (imageFile) {
        await uploadImageWithFetch();
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
    // Don't process if we're in the middle of a reset
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
      age: user.age !== -999 ? user.age.toString() : '',
      gender: sanitizeValue(user.gender),
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
  
    // Only update if originalData hasn't been set yet, or if user data has actually changed
    const shouldUpdate = 
      originalData.formData.fullName === '' || // First time loading
      JSON.stringify(originalData.formData) !== JSON.stringify(newFormData) || 
      JSON.stringify(originalData.selectedDestinations) !== JSON.stringify(newSelectedDestinations) ||
      JSON.stringify(originalData.selectedTravelStyles) !== JSON.stringify(newSelectedTravelStyles);
  
    if (shouldUpdate) {
      setFormData(newFormData);
      setSelected(newSelectedDestinations);
      setSelectedItems(newSelectedTravelStyles);
  
      const originalDataSnapshot = {
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

  // Render functions
  const renderError = (error?: string) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  const filteredDestinations = destinations.filter(dest =>
    dest.toLowerCase().includes(searchText.toLowerCase())
  );

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <FontAwesome name="angle-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>สร้างโปรไฟล์</Text>
            {userId?  (<TouchableOpacity onPress={handleLogout}>
          <Text style={{color:'blue'}}>Logout</Text>
        </TouchableOpacity>):null}
      </View>
  
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]} 
          />
        </View>
      </View>
  
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={pickImage}
          >
            <Image
              source={
                imageFile?.uri && imageFile.uri!=="" ? { uri: imageFile.uri } :  
                user?.profileImageUrl ? { uri: user.profileImageUrl } :
                { uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' }
              }
              style={styles.profileImage}
            />
            <View style={styles.cameraButton}>
              <Image
                source={require('../assets/images/images/images/image6.png')} 
                style={{height:16,width:16}}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.uploadText}>อัพโหลดรูปโปรไฟล์ของคุณ</Text>
        </View>
  
        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อ</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="ชื่อจริง และ นามสกุล"
              value={formData.fullName}
              onChangeText={(text: string) => {
                setFormData({...formData, fullName: text});
                if (errors.fullName) {
                  setErrors({...errors, fullName: undefined});
                }
              }}
              placeholderTextColor="#999"
            />
            {renderError(errors.fullName)}
          </View>
  
          {/* Nickname */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อเล่น</Text>
            <TextInput
              style={[styles.input, errors.nickname && styles.inputError]}
              placeholder="ชื่อสำหรับแสดงในแอป"
              value={formData.nickname}
              onChangeText={(text: string) => {
                setFormData({ ...formData, nickname: text });
                if (errors.nickname) {
                  setErrors({ ...errors, nickname: undefined });
                }
              }}
              placeholderTextColor="#999"
            />
            {renderError(errors.nickname)}
          </View>
  
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="example@email.com"
              value={formData.email}
              onChangeText={(text: string) => {
                setFormData({...formData, email: text});
                if (errors.email) {
                  setErrors({...errors, email: undefined});
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            {renderError(errors.email)}
          </View>
  
          {/* Age and Gender Row */}
          <View style={[{ flexDirection: 'row', gap: 10 }, styles.inputGroup]}>
            {/* Age */}
            <View style={[{ flex: 1 }]}>
              <Text style={styles.label}>อายุ</Text>
              <TextInput
                value={formData.age}
                style={[styles.input, errors.age && styles.inputError]}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  let age=parseInt(numericText,10)

                  if(!isNaN(age) && age>120){
                    age=120
                  }
                  setFormData({ ...formData, age: isNaN(age)?numericText:age.toString() });
                  if (errors.age) setErrors({ ...errors, age: undefined });
                }}
                keyboardType="numeric"
                placeholder="อายุของคุณ"
                placeholderTextColor="#999"
              />
              {renderError(errors.age)}
            </View>
  
            {/* Gender Dropdown */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>เพศ</Text>
              
              <View style={[styles.inputWithIcon, errors.gender && styles.inputError]}>
                <View style={styles.textDisplayArea}>
                  <Text style={styles.displayText}>
                    {formData.gender || 'เลือกเพศ'}
                  </Text>
                </View>
  
                <TouchableOpacity
                  onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                  style={styles.iconButton}
                >
                  <Image
                    source={require('../assets/images/images/images/image10.png')}
                    style={styles.dropdownIcon}
                  />
                </TouchableOpacity>
              </View>
  
              {showGenderDropdown && (
                <View style={styles.dropdownList}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setFormData({
                          ...formData,
                          gender: option,
                          customGender: ''
                        });
                        setShowGenderDropdown(false);
                        if (errors.gender) setErrors({ ...errors, gender: undefined });
                      }}
                      style={[
                        styles.dropdownItem,
                        formData.gender === option && styles.dropdownItemSelected,
                      ]}
                    >
                      <Text>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {renderError(errors.gender)}
            </View>
          </View>
  
          {/* Additional Contacts */}
          <Text style={styles.label}>ช่องทางการติดต่อเพิ่มเติม (ไม่บังคับ)</Text>
          
          {/* Facebook */}
          <View style={styles.socialInputContainer}>
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            <TextInput
              style={[styles.socialInput, errors.facebookUrl && styles.inputError]}
              placeholder="Facebook URL หรือ Username"
              value={formData.facebookUrl}
              onChangeText={(text: string) => {
                setFormData({...formData, facebookUrl: text});
                if (errors.facebookUrl) {
                  setErrors({...errors, facebookUrl: undefined});
                }
              }}
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>
          {renderError(errors.facebookUrl)}
  
          {/* LINE */}
          <View style={styles.socialInputContainer}>
            <Image
              source={require('../assets/images/images/images/image7.png')}
              style={{height:16,width:16}}
              resizeMode="contain"
            />
            <TextInput
              style={[styles.socialInput, errors.lineId && styles.inputError]}
              placeholder="LINE ID"
              value={formData.lineId}
              onChangeText={(text: string) => {
                setFormData({...formData, lineId: text});
                if (errors.lineId) {
                  setErrors({...errors, lineId: undefined});
                }
              }}
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>
          {renderError(errors.lineId)}
  
          {/* Travel Interests Section */}
          <View style={styles.content}>
            <Text style={styles.title}>ความสนใจเที่ยว</Text>
            
            <Text style={styles.subtitle}>
              เลือกกิจกรรมที่คุณชอบทำเวลาเที่ยว (เลือกได้หลายข้อ)
            </Text>
  
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>กำลังโหลด...</Text>
              </View>
            ) : (
              <View style={styles.categoriesContainer}>
                {categories.map((category: Category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      selectedItems.includes(category.id) && styles.selectedItem
                    ]}
                    onPress={() => toggleSelection(category.id)}
                  >
                    <Image
                      source={{ 
                        uri: selectedItems.includes(category.id) 
                          ? category.activeIconImageUrl 
                          : category.iconImageUrl 
                      }}
                      style={{
                        width: 15.75,
                        height: 14,
                        tintColor: selectedItems.includes(category.id) ? '#6366f1' : '#000',
                      }}
                      resizeMode="contain"
                    />
  
                    <Text style={[
                      styles.categoryText,
                      selectedItems.includes(category.id) && styles.selectedText
                    ]}>
                      {category.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
  
          {/* Destinations Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.title}>จุดหมายปลายทางที่อยากไป</Text>
            <Text style={styles.subtitle}>เลือกประเทศที่คุณสนใจ</Text>
  
            {/* Destination Search and Dropdown */}
            <View style={styles.destinationContainer}>
              <TouchableOpacity onPress={() => setDropdownOpen(!dropdownOpen)}>
                <View style={styles.inputContainer}>
                  {dropdownOpen ? (
                    <TextInput
                      style={styles.input}
                      placeholder="ค้นหาสถานที่"
                      value={searchText}
                      onChangeText={setSearchText}
                      autoFocus={true}
                    />
                  ) : (
                    <Text style={styles.input}>
                      <Image 
                        source={require('../assets/images/images/images/image9.png')} 
                        style={{width:16,height:16}}
                      />
                      {' '}ค้นหาสถานที่
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
  
              {dropdownOpen && (
                <View style={styles.dropdown}>
                  {loading ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <FlatList
                      data={filteredDestinations}
                      keyExtractor={item => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => addDestination(item)}
                        >
                          <Text>{item}</Text>
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        <Text style={styles.emptyText}>ไม่พบสถานที่ที่ค้นหา</Text>
                      }
                    />
                  )}
                </View>
              )}
                   {/* Selected Destinations Display */}
            {selected.length > 0 && (
              <View style={styles.tagsContainer}>
                {selected.map((dest: string, index: number) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.selectedTag}
                    onPress={() => removeDestination(dest)}
                  >
                    <Text style={styles.selectedTagText}>{dest}</Text>
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            </View>
          </View>
        </View>
      </ScrollView>
  
      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>บันทึกและดำเนินการต่อ</Text>
        <Image
          source={require('../assets/images/images/images/image8.png')}
          style={{height:16,width:16}}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}


export default ProfileForm
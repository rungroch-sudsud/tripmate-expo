import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import {DestinationsComponent} from '../../components/Edit_CreateTrip_jsx'
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
import ProgressBar from  '../../components/ProgressBar'
import {Category,ApiResponse} from '../../shared/schemas/api.schema'
import {User} from '../../shared/schemas/user_schema'
import {ValidationErrors}  from  '../../shared/schemas/errors_schema'
import {ProfileFormData} from  '../../shared/schemas/form_schema'
import { PickedFile } from '@/shared/schemas/file_type'; '../../src/shared/schemas/file_type'
import {validateAge,validateEmail,validateFacebookUrl,validateFullName,validateNickname,validateLineId, fetchTravelStyles,validateOccupation} from  '../../features/user/services/userServices'
import {sanitizeValue} from '../../shared/utils/sanitizeValue'
import  {convertBase64ToFile} from '../../shared/utils/file.util'
import {travelPersonalities,transportationStyles} from '../../features/user/services/userServices'
import {TravelStylesComponent} from '../../components/Edit_CreateTrip_jsx'



const ProfileForm: React.FC = () => {


  // State management
  const [selectedTravel, setSelectedTravel] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState([]);
  const [selectedTravelIds, setSelectedTravelIds] = useState([]);
  const [selectedTransportIds, setSelectedTransportIds] = useState([]);
  const [imageTextArray,setimageTextArray]=useState([])
  const [imageFile, setImageFile] = useState<PickedFile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
   
  // Destinations
  const [destinations, setDestinations] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
const [destinationError, setDestinationError] = useState<string | null>(null);
  // Travel Styles
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Form data
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    nickname: '',
    occupation:'',
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
      occupation:'',
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
      const [destinationsResponse, travelStylesResponse,travelPersonalitiesResponse, transportationRespons] = await Promise.all([
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
    setSelectedTransport(transportationRespons || []);
    
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
  const toggleSelection = (id: string): void => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleTravelPersonalityToggle = (id) => {
  setSelectedTravelIds(prev => 
    prev.includes(id) 
      ? prev.filter(item => item !== id)
      : [...prev, id]
  );
};

const handleTransportToggle = (id) => {
  setSelectedTransportIds(prev => 
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

  const clearError = () => {
  setDestinationError(null);
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


// Optimized version with better performance
const pickImageWithText = useCallback(() => {
  const options = {
    mediaType: 'photo',
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8, // Add compression
    storageOptions: {
      skipBackup: true,
      path: 'images'
    },
    presentationStyle: 'overFullScreen',
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

    // More efficient ID generation
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    
    const newImageItem = {
      id: uniqueId,
      uri: pickedImage.uri,
      type: pickedImage.type ?? 'image/jpeg',
      name: pickedImage.fileName ?? `image-${Date.now()}.jpg`,
      text: '',
    };

    // Simplified state update without duplicate check
    setimageTextArray(prev => [...prev, newImageItem]);
    
    console.log('Image added successfully with ID:', uniqueId);
  });
}, []);

const removeImageFromArray = (id) => {
  setimageTextArray(prev => prev.filter(item => item.id !== id));
  console.log('Image removed with ID:', id);
};

const updateImageText = (id, newText) => {
  setimageTextArray(prev => 
    prev.map(item => 
      item.id === id ? { ...item, text: newText } : item
    )
  );
};

// Optional
const checkForDuplicates = () => {
  const ids = imageTextArray.map(item => item.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    console.log('Duplicate IDs found:', duplicates);
  }
  return duplicates;
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
    
    // Update profile first
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

    // Upload profile image if exists
    if (imageFile) {
      await uploadImageWithFetch();
    }

    // Upload past trip images
    if (imageTextArray.length > 0) {
      await uploadPastTripImages();
    }

    router.push('/findTrips');
  } catch (error) {
    console.error("Error updating profile:", error);
    Alert.alert('Error', 'Failed to update profile. Please try again.');
  }
};

// New function to upload past trip images
const uploadPastTripImages = async (): Promise<void> => {
  try {
    for (const imageItem of imageTextArray) {
      const formData = new FormData();
      
      // Convert base64 to blob/file
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
    throw error; // Re-throw to handle in main try-catch
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

 
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
         <Image source={require('../assets/images/back.png')} style={{height:8,width:14}}/>
        </TouchableOpacity>
        <Text style={styles.headerText}>สร้างโปรไฟล์</Text>
            {userId?  (<TouchableOpacity onPress={handleLogout}>
          <Text style={{color:'#585DDB',fontFamily:'LineSeedSansTH',fontSize:14}}>บันทึก</Text>
        </TouchableOpacity>):null}
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
                imageFile?.uri && imageFile.uri!=="" ? { uri: imageFile.uri } :  
                user?.profileImageUrl ? { uri: user.profileImageUrl } :
                { uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' }
              }
              style={[styles.profileImage, imageFile?.uri ?{borderWidth:0}:{borderColor:'#585DDB',borderWidth:1}]}
            />
            <View style={styles.cameraButton}>
              <Image
                source={require('../assets/images/images/images/image6.png')} 
                style={{height:16,width:16}}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
  
        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}


         <View style={[{backgroundColor:'#F3F4F6',borderRadius:10,paddingHorizontal:20,paddingVertical:15},!errors.fullName && { marginBottom: 20 }]}>
          <Text style={{fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',color:'#374151',fontSize:10}}>ชื่อ-นามสกุล</Text>
           <TextInput
          value={formData.fullName}
          onChangeText={(text)=>{
            setFormData({...formData,fullName:text})
            if(errors.fullName){
              setErrors({...errors,fullName:undefined})
            }
          }}
          
          placeholder='กรอกชื่อจริงและนามสกุลของคุณ'
          style={{backgroundColor:'#F3F4F6',color:'#374151',outlineWidth:0,paddingVertical:2,fontFamily:'LineSeedSansTH_A_Bd',fontSize:13,fontWeight:'700'}}
          />
         </View>
                  {errors.fullName && (
    <Text style={{
      color: 'red',
      fontSize: 12,
      marginTop: 4,
      marginLeft:20,
      marginBottom:20,
      fontFamily: 'LineSeedSansTH_A_Bd',
      fontWeight: '700'
    }}>
      {errors.fullName}
    </Text>
  )}

   
  
          {/* Nickname */}

           <View style={[{backgroundColor:'#F3F4F6',borderRadius:10,paddingHorizontal:20,paddingVertical:15}, !errors.nickname && { marginBottom: 20 },]}>
          <Text style={{fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',color:'#374151',fontSize:10}}>ชื่อเล่น</Text>
           <TextInput
          value={formData.nickname}
          onChangeText={(text)=>{
            setFormData({...formData,nickname:text})
            if(errors.fullName){
              setErrors({...errors,nickname:undefined})
            }
          }}
          
          placeholder='กรอกชื่อสำหรับสแดงในแอป'
          style={{backgroundColor:'#F3F4F6',color:'#374151',outlineWidth:0,paddingVertical:2,fontFamily:'LineSeedSansTH_A_Bd',fontSize:13,fontWeight:'700'}}
          />
         </View>
           {errors.nickname && (
    <Text style={{
      color: 'red',
      fontSize: 12,
      marginTop: 4,
      marginLeft:20,
      marginBottom:20,
      fontFamily: 'LineSeedSansTH_A_Bd',
      fontWeight: '700'
    }}>
      {errors.nickname}
    </Text>
  )}
 
  
          {/* Email */}

                <View style={[{backgroundColor:'#F3F4F6',borderRadius:10,paddingHorizontal:20,paddingVertical:15},!errors.email && { marginBottom: 20 }]}>
          <Text style={{fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',color:'#374151',fontSize:10}}>อีเมล</Text>
           <TextInput
          value={formData.email}
          onChangeText={(text)=>{
            setFormData({...formData,email:text})
            if(errors.fullName){
              setErrors({...errors,email:undefined})
            }
          }}
          
          placeholder='example@email.com'
          style={{backgroundColor:'#F3F4F6',color:'#374151',outlineWidth:0,paddingVertical:2,fontFamily:'LineSeedSansTH_A_Bd',fontSize:13,fontWeight:'700'}}
          />
         </View>
                {errors.nickname && (
    <Text style={{
      color: 'red',
      fontSize: 12,
      marginTop: 4,
      marginLeft:20,
      marginBottom:20,
      fontFamily: 'LineSeedSansTH_A_Bd',
      fontWeight: '700'
    }}>
      {errors.nickname}
    </Text>
  )}
       
  
          {/* Age and Gender Row */}
          <View style={[{ flexDirection: 'row', gap: 10 }, styles.inputGroup]}>
            {/* Age */}
            <View style={[{ flex: 1,backgroundColor:'#F3F4F6',borderRadius:10,paddingHorizontal:20,paddingVertical:10 }]}>
              <Text style={{fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',color:'#374151',fontSize:10}}>อายุ</Text>
              <TextInput
                value={formData.age}
                style={[errors.age && styles.inputError,{backgroundColor:'#F3F4F6',color:'#374151',outlineWidth:0,paddingVertical:2,fontFamily:'LineSeedSansTH_A_Bd',fontSize:13,fontWeight:'700'}]}
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
         <TouchableOpacity style={[{ flex: 1,backgroundColor:'#F3F4F6',borderRadius:10,paddingHorizontal:20,paddingVertical:10}]}
           onPress={() => setShowGenderDropdown(!showGenderDropdown)}
         >
                  <Text style={{fontFamily:'LineSeedSansTH_A_Bd',fontSize:10,fontWeight:'700'}}>เพศ</Text>
              
              <View style={[errors.gender && styles.inputError,{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}]}>
                <View>
                  <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:700}}>
                    {formData.gender || 'เลือกเพศ'}
                  </Text>
                </View>
  
                <View>
                  <Image
                    source={require('../assets/images/images/images/image10.png')}
                    style={{height:7.22,width:12.02}}
                  />
                </View>
              </View>
         </TouchableOpacity>
  
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
                      <Text style={{fontFamily:'LineSeedSansTH_A_Bd',fontSize:13,fontWeight:'700'}}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {renderError(errors.gender)}
            </View>
          </View>



          {/* Occupation */}

           <View style={[{backgroundColor:'#F3F4F6',borderRadius:10,paddingHorizontal:20,paddingVertical:15}, !errors.nickname && { marginBottom: 20 },]}>
          <Text style={{fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',color:'#374151',fontSize:10}}>อาชีพ</Text>
           <TextInput
          value={formData.occupation}
          onChangeText={(text)=>{
            setFormData({...formData,occupation:text})
            if(errors.fullName){
              setErrors({...errors,occupation:undefined})
            }
          }}
          
          placeholder='กรอกอาชีพของคุณ'
          style={{backgroundColor:'#F3F4F6',color:'#374151',outlineWidth:0,paddingVertical:2,fontFamily:'LineSeedSansTH_A_Bd',fontSize:13,fontWeight:'700'}}
          />
         </View>
           {errors.occupation && (
    <Text style={{
      color: 'red',
      fontSize: 12,
      marginTop: 4,
      marginLeft:20,
      marginBottom:20,
      fontFamily: 'LineSeedSansTH_A_Bd',
      fontWeight: '700'
    }}>
      {errors.occupation}
    </Text>
  )}
  
          {/* Additional Contacts */}
          <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:14,marginBottom:20}}>ช่องทางการติดต่อ</Text>
          
          {/* Facebook */}
         <View style={{flexDirection:'row',alignItems:'center',outlineWidth:0,backgroundColor:'#F3F4F6',borderRadius:10,marginBottom:15}}>
             <Image
              source={require('../assets/images/facebook.png')}
              style={{height:20,width:20,marginLeft:15}}
              resizeMode="contain"
            />
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
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>
          {renderError(errors.facebookUrl)}
  
          {/* LINE */}
          <View style={{flexDirection:'row',alignItems:'center',outlineWidth:0,backgroundColor:'#F3F4F6',borderRadius:10}}>
            <Image
              source={require('../assets/images/instagram.png')}
              style={{height:20,width:20,marginLeft:15}}
              resizeMode="contain"
            />
            <TextInput
              style={[styles.socialInput, errors.lineId && styles.inputError]}
              placeholder="Instagram URL หรือ Username"
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
       <TravelStylesComponent
  categories={categories}
  selectedItems={selectedItems}
  onToggleSelection={toggleSelection}
  loading={loading}
  styles={styles}
  title="ความสนใจเที่ยว"
  subtitle="เลือกกิจกรรมที่คุณชอบทำเวลาเที่ยว (เลือกได้หลายข้อ)"
  selectedColor="#6366f1"
  unselectedColor="#000"
  iconSize={{ width: 15.75, height: 14 }}
  isEditMode={false}
  highlightType="gradientcolor" 
/>



<View style={{marginTop:15,marginBottom:-20}}>
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
<View style={{marginTop:10}}>
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
       <View style={{backgroundColor:'#F3F4F6',borderRadius:15,paddingTop:10}}>
  <Text style={[styles.title,{marginLeft:22,fontFamily:'LineSeedSansTH_A_Bd',color:"#374151"}]}>จุดหมายปลายทางที่อยากไป</Text>
  <Text style={[styles.subtitle,{margin:22,marginTop:10,fontFamily:'LineSeedSansTH'}]}>เลือกสถานที่ที่คุณวางแผนจะไปเที่ยว</Text>

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

 <View style={{ backgroundColor: '#F3F4F6', borderRadius: 15, paddingTop: 10, marginTop: 20 }}>
      <Text style={[ { marginLeft: 22, fontFamily: 'LineSeedSansTH_A_Bd', color: "#374151" ,fontSize:13,marginBottom:15}]}>
        รูปภาพทริปที่เคยไป
      </Text>
      {/* Image Grid */}
    <View 
  style={{ 
    paddingHorizontal: 22, 
    paddingBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }}
>
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
            paddingHorizontal:10
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
          position:'absolute',
          top:70,
          outlineWidth:0,
          marginTop: 8,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingTop:10,
          fontSize: 12,
          height:35,
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
          style={{height:16,width:16}}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}


export default ProfileForm
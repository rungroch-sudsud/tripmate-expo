import React, { useState,useEffect,useRef } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Animated} from 'react-native';
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
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router,Stack } from 'expo-router';
import {axiosInstance} from '../lib/axios'
import axios from 'axios'
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

interface FormData {
  fullName: string;
  nickname: string;
  age: string;
  gender: string;
  customGender: string;
  email: string;
  facebookUrl: string;
  lineId: string;
  travelStyles: string[];          // only this, prefer this over travelInterests
  favouriteDestinations: string[];
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
  facebookUrl?: string;  // Add this
  lineId?: string;       // Add this
}

const ProfileForm: React.FC = () => {
  const [imageFile, setImageFile] = useState<PickedFile | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);

    const [destinations, setDestinations] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);


    


    const fetchTravelStyles = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/travel-styles'); 
        
     
        
        const result: ApiResponse = response.data;
        
        const mappedCategories: Category[] = result.data.map(item => ({
          id: item.id,
          title: item.title,
          iconImageUrl: item.iconImageUrl,
          activeIconImageUrl: item.activeIconImageUrl || item.iconImageUrl,
        }));
        
        
        setCategories(mappedCategories);
      } catch (error) {
        console.error('Failed to fetch travel styles:', error);
        Alert.alert(
          'Error',
          'Failed to load travel styles. Please try again.',
          [{ text: 'OK' }]
        );
        // Fallback to empty array or default categories
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

     const toggleSelection = (id: string): void => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  
  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/destinations')
      .then(response => {
        setDestinations(response.data.data || []);
      })
      .catch(err => {
        console.error('Axios error:', err);
        setDestinations([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  // Add filtered destinations based on search
  const filteredDestinations = destinations.filter(dest =>
    dest.toLowerCase().includes(searchText.toLowerCase())
  );
  
  function addDestination(dest: string) {
    if (!selected.includes(dest)) {
      setSelected([...selected, dest]);
    }
    setDropdownOpen(false);
    setSearchText(''); // Clear search when selecting
  }
  
  function removeDestination(dest: string) {
    setSelected(selected.filter(d => d !== dest));
  }


    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    useEffect(() => {
        const fetchEmail = async () => {
          const storedID = await AsyncStorage.getItem('userId');
          console.log('User Id:', storedID);
          setEmail(storedID);
        };
      
        fetchEmail();
      }, []);
     // console.log('User ID:', email);

     useEffect(() => {
      const initializeData = async () => {
        try {
          // Fetch all available travel styles first
          await fetchTravelStyles();
          
          // Then load user's existing travel styles
          const savedTravelStyles = await AsyncStorage.getItem('travelStyles');
          if (savedTravelStyles) {
            const userTravelStyles = JSON.parse(savedTravelStyles);
            
            // Since userTravelStyles is already an array of IDs, use directly
            setSelectedItems(userTravelStyles);
            
            if (__DEV__) {
              console.log('Loaded user travel styles:', userTravelStyles);
              console.log('Selected IDs:', userTravelStyles);
            }
          }
        } catch (error) {
          console.error('Error initializing data:', error);
        }
      };
    
      initializeData();
    }, []);

      console.log("Catagories IDDDDDD:  "+selectedCategories);
      

    const progressAnimation = useRef(new Animated.Value(66.66)).current;

  useEffect(() => {

 
    
    const animateProgress = () => {
      Animated.timing(progressAnimation, {
        toValue: 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    setTimeout(animateProgress, 300);

    fetchTravelStyles();
  }, []);
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
  
  
  

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  const genderOptions = ['ผู้ชาย', 'ผู้หญิง', 'อื่นๆ'] as const;

  




  const validateFullName = (name: string): string | null => {
    if (!name.trim()) {
      return 'กรุณากรอกชื่อ-นามสกุล';
    }

    

    // Check for special characters (allow only Thai, English letters and single space)
    const specialCharRegex = /[^a-zA-Zก-๙\s]/;
    if (specialCharRegex.test(name)) {
      return 'ชื่อ-นามสกุลไม่สามารถมีอักขระพิเศษได้';
    }

    // Check for multiple spaces
    if (name.includes('  ')) {
      return 'ชื่อ-นามสกุลไม่สามารถมีช่องว่างมากกว่า 1 ช่องได้';
    }

    // Split by space and check parts
    const parts = name.trim().split(' ');
    
    // Must have exactly 2 parts (first name and last name)
    if (parts.length !== 2) {
      return 'กรุณากรอกชื่อและนามสกุล คั่นด้วยช่องว่าง 1 ช่อง';
    }

    // Both parts must not be empty
    if (parts[0].length === 0 || parts[1].length === 0) {
      return 'กรุณากรอกชื่อและนามสกุลให้ครบถ้วน';
    }

    return null;
  };

  const validatenickName = (name: string): string | null => {
    const trimmed = name.trim();
  
    if (!trimmed) {
      return 'กรุณากรอกชื่อเล่น';
    }
  
    // Check for spaces (only one word allowed)
    if (trimmed.includes(' ')) {
      return 'ชื่อเล่นต้องเป็นคำเดียวโดยไม่มีช่องว่าง';
    }
  
    // Check for special characters (only Thai or English letters allowed)
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
    if (!url.trim()) return undefined; // Empty is OK
    
    // Check if it's a valid Facebook URL or username
    const facebookUrlRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+/i;
    const usernameRegex = /^[a-zA-Z0-9.]{5,}$/; // Basic username format
    
    if (facebookUrlRegex.test(url) || usernameRegex.test(url)) {
      return undefined; // Valid
    }
    
    return "กรุณาใส่ Facebook URL ที่ถูกต้อง หรือ Username";
  };
  
  const validateLineId = (lineId: string): string | undefined => {
    if (!lineId.trim()) return undefined; // Empty is OK
    
    // LINE ID validation: letters, numbers, dots, underscores, hyphens, 4-20 characters
    const lineIdRegex = /^[a-zA-Z0-9._-]{4,20}$/;
    
    if (lineIdRegex.test(lineId)) {
      return undefined; // Valid
    }
    
    return "LINE ID ต้องมี 4-20 ตัวอักษร และใช้ได้เฉพาะ a-z, 0-9, ., _, -";
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
  
    // Validate full name
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;
  
    const nicknameError = validatenickName(formData.nickname);
    if (nicknameError) newErrors.nickname = nicknameError;
  
    // Validate age
    const ageError = validateAge(formData.age);
    if (ageError) newErrors.age = ageError;
  
    // Validate gender
    if (!formData.gender) {
      newErrors.gender = 'กรุณาเลือกเพศ';
    }
  
    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
  
    // Validate Facebook URL (only if filled)
    const facebookError = validateFacebookUrl(formData.facebookUrl);
    if (facebookError) newErrors.facebookUrl = facebookError;
  
    // Validate LINE ID (only if filled)
    const lineError = validateLineId(formData.lineId);
    if (lineError) newErrors.lineId = lineError;
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };




  
  

  const removeSelectedInterest = (interest: string): void => {
    setSelectedInterests(selectedInterests.filter(item => item !== interest));
  };

  const handleBack = (): void => {
    router.push('/account-verification')
    console.log("Back");
    
  };


  const convertBase64ToFile = (base64Uri: string, filename: string, mimeType: string) => {
    // Extract base64 data
    const base64Data = base64Uri.split(',')[1];
    return {
      uri: base64Uri, // Keep original for display
      base64Data: base64Data,
      type: mimeType,
      name: filename,
      isBase64: true,
    };
  };

   const pickImage = () => {
    // Compatible options for different versions of react-native-image-picker
    const options: any = {
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      // Force file URI instead of base64
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
        
        // Handle base64 data URIs (common in web environment)
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

        // Validate that we have a proper file URI
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

        console.log('🟢 Image picked successfully:', {
          uri: pickedImage.uri.substring(0, 50) + '...',
          type: pickedImage.type,
          name: pickedImage.fileName,
          size: pickedImage.fileSize,
        });
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
      // Convert base64 to Blob for FormData
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
      // Create proper file object for FormData
      const fileObj = {
        uri: imageFile.uri,
        type: imageFile.type,
        name: imageFile.name,
      } as any;

      formData.append('file', fileObj);
    }

    console.log('🟢 FormData upload with file:', {
      uri: imageFile.uri.substring(0, 50) + '...',
      type: imageFile.type,
      name: imageFile.name,
      size: imageFile.size,
    });

    setUploading(true);
    setResponseMessage(null);

    try {
      const userId = await AsyncStorage.getItem('userId');
      
      // Use your configured axios instance (already has token interceptor)
      const response = await axiosInstance.patch(`/users/profile/image/${userId}`, formData, {
        headers: {
         
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
    }finally {
      setUploading(false);
    }
  };


  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      console.log('ข้อผิดพลาด', 'กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง');
      return;
    }
  
    else{
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('ข้อผิดพลาด', 'ไม่พบ userID');
        return;
      }
    
      const selectedStyleNames = categories
        .filter(cat => selectedItems.includes(cat.id))
        .map(cat => cat.id);
    
   try{
    const profileData = {
      fullname: formData.fullName,
      nickname: formData.nickname,
      email: formData.email,
      gender: formData.gender,
      age: Number(formData.age),
      travelStyles: selectedStyleNames,
      destinations: Array.from(new Set(selected)),
      lineId: formData.lineId || '',
      facebookUrl: formData.facebookUrl || '',
    };
    const profileResponse=await axiosInstance.patch(`/users/profile/${userId}`,profileData,{
      headers:{
        "Content-Type":'application/json'
      }
    })
    console.log("Profile updated successfully:", profileResponse.data);
   }catch(error){
    console.error("Error Updating User Profile: ",error);
    
   }
    try{
      uploadImageWithFetch()
      router.push('/createTrip')
    }catch(error){
      console.error("Error uploading Profile Image: ",error);
      
    }

    }
  };
    const renderError = (error?: string) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <FontAwesome name="angle-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>สร้างโปรไฟล์</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 33.33],
                  outputRange: ['0%', '33.33%'],
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
        imageFile ? { uri: imageFile.uri } : { uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' }
      }
      style={styles.profileImage}
    />
    <View style={styles.cameraButton}>
    <Image
        source={require('../assets/images/images/image6.png')} 
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
            <Text style={styles.label}>ชื่อ </Text>
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

          <View style={[{ flexDirection: 'row',gap:10 }, styles.inputGroup]}>

        {/* Age */}
        <View style={[{ flex: 1 }]}>

          <Text style={styles.label}>อายุ</Text>
          <TextInput
            value={formData.age}
            style={styles.input}
            onChangeText={(text) => {
              setFormData({ ...formData, age: text });
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
  
  {/* Container with input/text and icon */}
  <View style={styles.inputWithIcon}>
    {/* Left side - Always show text display */}
    <View style={styles.textDisplayArea}>
      <Text style={styles.displayText}>
        {formData.gender || 'เลือกเพศ'}
      </Text>
    </View>

    {/* Right side - Always visible clickable icon */}
    <TouchableOpacity
      onPress={() => setShowGenderDropdown(!showGenderDropdown)}
      style={styles.iconButton}
    >
      <Image
        source={require('../assets/images/images/image10.png')}
        style={styles.dropdownIcon}
      />
    </TouchableOpacity>
  </View>

  {/* Dropdown list */}
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
    source={require('../assets/images/images/image7.png')}
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

            <View style={styles.content}>
        <Text style={styles.title}>
        ความสนใจเที่ยว 
        </Text>
      
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
  source={{ uri: category.iconImageUrl || 'https://via.placeholder.com/30x30/000000/FFFFFF?text=?' }}
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
         <View style={styles.inputGroup}>
            <Text style={styles.title}>จุดหมายปลายทางที่อยากไป</Text>
            <Text style={styles.subtitle}>เลือกประเภทที่คุณสนใจ</Text>
            
            {/* Selected Interests */}
            {selectedInterests.length > 0 && (
              <View style={styles.tagsContainer}>
                {selectedInterests.map((interest: string, index: number) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.selectedTag}
                    onPress={() => removeSelectedInterest(interest)}
                  >
                    <Text style={styles.selectedTagText}>{interest}</Text>
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

<View style={styles.container}>
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
        <Text style={styles.input}><Image source={require('../assets/images/images/image9.png')} style={{width:16,height:16,}}/>{' '} ค้นหาสถานที่</Text>
      )}
    </View>
  </TouchableOpacity>

  {dropdownOpen && (
    <View style={styles.dropdown}>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <FlatList
          data={filteredDestinations} // Use filtered data
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

  <View style={styles.selectedContainer}>
    <View style={styles.selectedGrid}>
      {selected.map(dest => (
        <TouchableOpacity
          key={dest}
          style={styles.selectedButton}
          onPress={() => removeDestination(dest)}
        >
          <Text style={styles.selectedButtonText}>
            {dest} <Text style={{fontSize: 16}}>×</Text>
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
</View>
        </View>
    </View>

      

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>บันทึกและดำเนินการต่อ</Text>
          <Image
        source={require('../assets/images/images/image8.png')} // Replace with your image path
        style={{height:16,width:16}}
        resizeMode="contain"
      />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer:{
  
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 112,
    height: 112,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#4F46E5', 
  },
  
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    borderRadius: 9999,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  uploadText: {
    fontSize: 14,
    fontFamily:'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight:14
  },
  formSection: {
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily:'Inter_500Medium',
    color: '#374151',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily:'Inter_400Regular',
    lineHeight:24,
    color: '#374151',
    height:50,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    gap: 12,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  genderOptionSelected: {
    // Additional styling for selected option if needed
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#6B46C1',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B46C1',
  },
  genderText: {
    fontSize: 16,
    color: '#333',
  },
  genderTextSelected: {
    color: '#6B46C1',
    fontWeight: '500',
  },
  customGenderInput: {
    marginTop: 12,
  },
  socialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  socialInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 16,
    fontFamily:'Inter_400Regular',
    color: '#374151',
    lineHeight:24,
    marginLeft:10,
    width:'100%'
  },
  lineIcon: {
    backgroundColor: '#00B900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lineText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectedTag: {
    backgroundColor: '#6B46C1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4,
  },
  availableTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  availableTagText: {
    color: '#666',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 8,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  headerText: {
    fontSize: 18,
    fontFamily:'Inter_500Medium',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginBottom:12,
    marginTop:12,
    marginLeft:-25
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  progressContainer: {
    paddingBottom: 15,
   },
   progressBar: {
     height: 4,
     backgroundColor: '#e0e0e0',
     borderRadius: 2,
     overflow: 'hidden',
   },
   progressFill: {
     height: '100%',
     backgroundColor: '#4F46E5',
     borderRadius: 2,
   },
 
   dropdownButton: {
     padding: 12,
     borderWidth: 1,
     borderColor: '#999',
     borderRadius: 6,
     backgroundColor: '#eee',
   },
   dropdownButtonText: { fontSize: 16 },
   dropdown: {
     marginTop: 5,
     borderWidth: 1,
     borderColor: '#999',
     borderRadius: 6,
     maxHeight: 200,
   },
   dropdownItem: {
     padding: 10,
     borderBottomWidth: 1,
     borderBottomColor: '#ddd',
   },
   selectedContainer: { marginTop: 20 },
   selectedItem: {
     flexDirection: 'row',
     padding: 8,
     marginBottom: 5,
     backgroundColor: '#4F46E51A',
     borderRadius: 9999,
     alignItems: 'center',
     justifyContent: 'space-between',
   },
   deleteButton: { marginLeft: 5 },
   selectedGrid: {
     flexDirection: 'row',
     flexWrap: 'wrap',
   },
   selectedButton: {
     backgroundColor: '#4F46E51A',
     borderWidth: 1,
     paddingHorizontal:8,
     paddingTop:7,
     borderRadius: 9999,
     margin: 5,
     borderColor:'#4F46E5',
     minWidth: 84.09,   
     height:38,
     alignItems: 'center',
   },
   selectedButtonText: {
     color: '#4F46E5',
     fontFamily:'Inter_400Regular',
     fontSize: 14,
   },


  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: '#f9f9f9',
  },
 
  dropdownItemSelected: {
    backgroundColor: '#d0c4f7',
  },
  content: {
    flex: 1,
    paddingTop: 10,
    marginBottom:24,
  },
  title: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    fontFamily:'Inter_500Medium'
  },


  subtitle: {
    fontSize: 12,
    lineHeight:13,
    color: '#6B7280',
    marginBottom: 12,
    fontFamily:'Inter_400Regular'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems:'center'
    
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    marginBottom: 8,
    height:38,
    minWidth:87.61,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    
  },
  emptyText: {
    padding: 10,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic'
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
    textAlign:'center',
    verticalAlign:'middle',
    fontFamily:'Inter_400Regular',
  },
  selectedText: {
    color: '#6366f1',
  },
  // Updated styles to match your existing input style
inputWithIcon: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#D1D5DB', // Match your input borderColor
  borderRadius: 8,
  backgroundColor: '#FFFFFF', // Match your input backgroundColor
  height: 50, // Match your input height
  overflow: 'visible', // Ensure icon is not clipped
},

textInputField: {
  flex: 1,
  paddingHorizontal: 12,
  paddingVertical: 12, // Match your input paddingVertical
  fontSize: 16,
  color: '#333',
  fontFamily: 'Inter_400Regular', // Match your input fontFamily
  lineHeight: 24, // Match your input lineHeight
  height: '100%', // Take full height of container
},

textDisplayArea: {
  flex: 1,
  paddingHorizontal: 12,
  paddingVertical: 12, // Match your input paddingVertical
  justifyContent: 'center',
  height: '100%', // Take full height of container
},

displayText: {
  fontSize: 16,
  color: '#ADAEBC', // Match your input placeholder color for consistency
  fontFamily: 'Inter_400Regular', // Match your input fontFamily
  lineHeight: 24, // Match your input lineHeight
},

iconButton: {
  paddingHorizontal: 8, // Reduced horizontal padding for mobile
  paddingVertical: 0, // Remove vertical padding
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 40, // Ensure minimum touchable area
  height: 48, // Slightly smaller than container height
},

dropdownIcon: {
  width: 18, // Slightly larger for better visibility
  height: 18, // Slightly larger for better visibility
  tintColor: '#666',
  resizeMode: 'contain', // Ensure icon scales properly
},
  

});

export default ProfileForm;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { axiosInstance } from '../../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';
import styles from '../../css/account-verification_styles';
import { PickedFile } from '../../shared/schemas/file_type';
import {} from '../../shared/schemas/form_schema'
import { convertBase64ToFile } from '../../shared/utils/file.util';
import { validateEmail, validateFullName, validatePhoneNumber } from '../../shared/utils/profileForm_util';
import { updateUserProfile } from '../../features/user/services/userServices';
import UploadBox from '../../components/UploadBox';

type FormField = {
  value: string;
  error: boolean;
  errorMessage: string;
  touched:boolean;
};

const PrivacySettings: React.FC = () => {
  // Changed to single image instead of array
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: { value: '', error: false, errorMessage: '' },
    phoneNumber: { value: '', error: false, errorMessage: '' },
    email: { value: '', error: false, errorMessage: '' },
    selfie: { error: false, errorMessage: '' },
  });

  const router = useRouter();
  const progressAnimation = useRef(new Animated.Value(66.66)).current;

  // SIMPLIFIED VALIDATORS - now using external functions
  const validators = {
    fullName: validateFullName,
    phoneNumber: validatePhoneNumber,
    email: validateEmail,
  };

  const updateFormField = (field: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], ...updates }
    }));
  };

  // Function to validate field on blur
  const validateField = (field: string, value: string) => {
    if (validators[field]) {
      const error = validators[field](value);
      if (error) {
        updateFormField(field, { error: true, errorMessage: error });
      } else {
        updateFormField(field, { error: false, errorMessage: '' });
      }
    }
  };

  // Function to format phone number (remove non-digits)
  const formatPhoneNumber = (text: string) => {
    return text.replace(/[^0-9]/g, '');
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setLoading(true);
      const response = await axiosInstance.get(`/users/profile/${userId}`);
      const userProfile = response.data.data;

      if (userProfile.email) {
        updateFormField('email', { value: userProfile.email });
         updateFormField('fullName', { value: userProfile.fullname });
      }
    } catch (error) {
      console.error("Error in fetching user profile", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(progressAnimation, {
        toValue: 83.33,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, 300);
  }, []);

  const pickImage = () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxWidth: 1024,
      maxHeight: 1024,
      storageOptions: { skipBackup: true, path: 'images' },
      presentationStyle: 'overFullScreen' as const,
    };

    launchImageLibrary(options, (response: any) => {
      if (response.didCancel || response.errorMessage) {
        console.log('Image picker cancelled or error:', response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const pickedImage = response.assets[0];
        let fileData: PickedFile;

        if (pickedImage.uri?.startsWith('data:')) {
          const convertedFile = convertBase64ToFile(
            pickedImage.uri,
            pickedImage.fileName ?? `image-${Date.now()}.jpg`,
            pickedImage.type ?? 'image/jpeg'
          );
          fileData = { ...convertedFile, isBase64: true };
        } else {
          fileData = {
            uri: pickedImage.uri,
            type: pickedImage.type ?? 'image/jpeg',
            name: pickedImage.fileName ?? `image-${Date.now()}.jpg`,
            size: pickedImage.fileSize,
          };
        }

        setPickedFile(fileData);
        // Clear selfie error when image is selected
        updateFormField('selfie', { error: false, errorMessage: '' });
      }
    });
  };

  const uploadImage = async (file: PickedFile, endpoint: string) => {
    const formData = new FormData();
    
    if (file.isBase64 && file.base64Data) {
      const byteCharacters = atob(file.base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });
      formData.append('file', blob, file.name);
    } else {
      formData.append('file', file as any);
    }

    const userId = await AsyncStorage.getItem('userId');
    return axiosInstance.patch(`/users/profile/${endpoint}/${userId}`, formData);
  };

  const handleSubmit = async () => {
    let hasError = false;

    // Validate form fields using external validators
    Object.keys(validators).forEach(field => {
      const error = validators[field](formData[field].value);
      if (error) {
        updateFormField(field, { error: true, errorMessage: error });
        hasError = true;
      } else {
        updateFormField(field, { error: false, errorMessage: '' });
      }
    });

    if (!pickedFile) {
      updateFormField('selfie', { error: true, errorMessage: 'กรุณาอัพโหลดภาพถ่ายยืนยันตัวตน' });
      hasError = true;
    } else {
      updateFormField('selfie', { error: false, errorMessage: '' });
    }

    if (hasError) return;

    try {
      setUploading(true);
      
      // Update profile using external service
      const profileData = {
        fullname: formData.fullName.value,
        email: formData.email.value,
        phoneNumber: formData.phoneNumber.value,
      };
      
      const result = await updateUserProfile(profileData);
      if (!result.success) {
        throw result.error;
      }

      // Upload image
      if (pickedFile) {
        await uploadImage(pickedFile, 'portrait/image');
      }

      setResponseMessage('Success: Profile updated successfully');
      resetFormState();
      router.push('/profile');
      
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || error.message || 'Update failed';
        setResponseMessage(`Error: ${message}`);
      } else {
        setResponseMessage(`Error: ${String(error)}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const resetFormState = () => {
    setPickedFile(null);
    setFormData({
      fullName: { value: '', error: false, errorMessage: '' },
      phoneNumber: { value: '', error: false, errorMessage: '' },
      email: { value: '', error: false, errorMessage: '' },
      selfie: { error: false, errorMessage: '' },
    });
    setUploading(false);
    setResponseMessage(null);
    setLoading(false);
  };

  const handleGoBack = () => {
    resetFormState();
    router.push('/travel-style');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <FontAwesome name="angle-left" size={30} color="#333" style={{marginLeft:10}}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ยืนยันตัวตน</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Privacy Shield Section */}
        <View style={styles.privacySection}>
          <View style={styles.shieldIcon}>
            <Image
              source={require('../assets/images/images/images/image1.png')}
              style={{ height: 36, width: 36 }}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.privacyTitle,{marginBottom:10}]}>ยืนยันตัวตนของคุณ</Text>
          <Text style={styles.privacySubtitle}>
            เพิ่มความน่าเชื่อถือให้โปรไฟล์ของคุณ 
          </Text>
          <Text style={[styles.privacySubtitle,{marginTop:-8}]}>
            และสร้างความปลอดภัยในคอมมูนิตี้ (ไม่บังคับ)
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Full Name Input */}
          <View style={{backgroundColor:"#F3F4F6",paddingHorizontal:20,paddingVertical:15,borderRadius:10,marginBottom:15, borderColor: formData.fullName.error ? 'red' : 'transparent',}}>
             <Text style={{color:'#9CA3AF',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10}}>ชื่อ-นามสกุล (ตามบัตรประชาชน)</Text>
            <TextInput
  value={formData.fullName.value}
  onChangeText={(text) => {
    updateFormField('fullName', { value: text });
    // Clear error immediately when user starts typing (good UX)
    if (formData.fullName.error) {
      updateFormField('fullName', { error: false, errorMessage: '' });
    }
  }}
  onBlur={() => {
    // Mark field as touched and then validate
    updateFormField('fullName', { touched: true });
    validateField('fullName', formData.fullName.value);
  }}
  placeholder='กรอกชื่อจริงของคุณ'
  placeholderTextColor='#9CA3AF'
  style={{
    fontFamily: 'LineSeedSansTH_A_Bd',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    outlineWidth: 0,
    borderRadius: 8,
    paddingVertical: 2
  }}
/>
          </View>
          {formData.fullName.error && (
            <Text style={{ color: 'red', fontSize: 12, marginTop: -10, marginBottom: 10, marginLeft: 20,fontFamily:'LineSeedSansTH' }}>
              {formData.fullName.errorMessage}
            </Text>
          )}
        
          <UploadBox
            styles={styles}
            index={1}
            label="ภาพถ่ายยืนยันตัวตน"
            placeholder="ถ่ายภาพตัวเองคู่กับบัตรประชาชน"
            subtitle="ถ่ายในที่แสงสว่างเพียงพอ เห็นหน้าชัดเจน"
            iconSource={require('../assets/images/images/images/image3.png')}
            pickedFile={pickedFile}
            onPress={pickImage}
            error={formData.selfie.error}
            errorMessage={formData.selfie.errorMessage}
          />

          {/* Contact Information */}
          <View style={styles.contactSection}>
            {/* Phone Number Input */}
            <View style={{backgroundColor:"#F3F4F6",paddingHorizontal:20,paddingVertical:15,borderRadius:10,marginBottom:15}}>
              <Text style={{color:'#9CA3AF',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10}}>เบอร์โทรศัพท์</Text>
      <TextInput
  value={formData.phoneNumber.value}
  onChangeText={(text) => {
    const formattedText = formatPhoneNumber(text);
    updateFormField('phoneNumber', { value: formattedText });
    // Clear error immediately when user starts typing
    if (formData.phoneNumber.error) {
      updateFormField('phoneNumber', { error: false, errorMessage: '' });
    }
  }}
  onBlur={() => {
    // Mark field as touched and then validate
    updateFormField('phoneNumber', { touched: true });
    validateField('phoneNumber', formData.phoneNumber.value);
  }}
  placeholder='0891234567'
  placeholderTextColor='#9CA3AF'
  keyboardType="numeric"
  maxLength={10}
  style={{
    fontFamily: 'LineSeedSansTH_A_Bd',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    outlineWidth: 0,
    borderRadius: 8,
    paddingVertical: 2
  }}
/>
            </View>
            {formData.phoneNumber.error && (
              <Text style={{ color: 'red', fontSize: 12, marginTop: -10, marginBottom: 10, marginLeft: 20,fontFamily:'LineSeedSansTH' }}>
                {formData.phoneNumber.errorMessage}
              </Text>
            )}
     
            {/* Email Input */}
            <View style={{backgroundColor:"#F3F4F6",paddingHorizontal:20,paddingVertical:15,borderRadius:10,marginBottom:15}}>
              <Text style={{color:'#9CA3AF',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10}}>อีเมล</Text>
        <TextInput
  keyboardType="email-address"
  value={formData.email.value}
  onChangeText={(text) => {
    updateFormField('email', { value: text });
    // Clear error immediately when user starts typing
    if (formData.email.error) {
      updateFormField('email', { error: false, errorMessage: '' });
    }
  }}
  onBlur={() => {
    // Mark field as touched and then validate
    updateFormField('email', { touched: true });
    validateField('email', formData.email.value);
  }}
  placeholder='example@email.com'
  placeholderTextColor='#9CA3AF'
  style={{
    fontFamily: 'LineSeedSansTH_A_Bd',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    outlineWidth: 0,
    borderRadius: 8,
    paddingVertical: 2
  }}
/>
            </View>
            {formData.email.error && (
              <Text style={{ color: 'red', fontSize: 12, marginTop: -10, marginBottom: 10, marginLeft: 20,fontFamily:'LineSeedSansTH' }}>
                {formData.email.errorMessage}
              </Text>
            )}
          </View>
        </View>

       
      </ScrollView>
     <View style={{paddingHorizontal:15,paddingBottom:10}}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {!isLoading && (
            <Image
              source={require('../assets/images/images/images/image5.png')}
              style={{ height: 16, width: 16 }}
              resizeMode="contain"
            />
          )}
          <Text style={styles.submitButtonText}>
            ยืนยันตัวตน
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          <Image
            source={require('../assets/images//images/images/image4.png')}
            style={{ height: 12, width: 10.5 }}
            resizeMode="contain"
          /> ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย
        </Text>
     </View>
    </View>
  );
};

export default PrivacySettings;
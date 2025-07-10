import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { axiosInstance } from '../../src/lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';
import styles from '../../src/css/account-verification_styles';
import { PickedFile } from '../../src/shared/schemas/file_type';
import {} from '../../src/shared/schemas/form_schema'
import { convertBase64ToFile } from '../../src/shared/utils/file.util';
import { validateEmail, validateFullName, validatePhoneNumber } from '../../src/shared/utils/profileForm_util';
import { updateUserProfile } from '../../src/services/userServices';
import UploadBox from '../../src/shared/components/UploadBox';
import TextInputField from '../../src/shared/components/TextInputField';
import ProgressBar from '../../src/shared/components/ProgressBar';

type FormField = {
  value: string;
  error: boolean;
  errorMessage: string;
};

const PrivacySettings: React.FC = () => {
  const [pickedFiles, setPickedFiles] = useState<(PickedFile | null)[]>([null, null]);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: { value: '', error: false, errorMessage: '' },
    phoneNumber: { value: '', error: false, errorMessage: '' },
    email: { value: '', error: false, errorMessage: '' },
    idCard: { error: false, errorMessage: '' },
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

  const fetchUserProfile = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setLoading(true);
      const response = await axiosInstance.get(`/users/profile/${userId}`);
      const userProfile = response.data.data;

      if (userProfile.email) {
        updateFormField('email', { value: userProfile.email });
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

  const pickImage = (index: number) => {
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

        setPickedFiles(prev => {
          const newFiles = [...prev];
          newFiles[index] = fileData;
          return newFiles;
        });
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

    // Validate images
    if (!pickedFiles[0]) {
      updateFormField('idCard', { error: true, errorMessage: 'กรุณาอัพโหลดรูปบัตรประชาชน' });
      hasError = true;
    } else {
      updateFormField('idCard', { error: false, errorMessage: '' });
    }

    if (!pickedFiles[1]) {
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

      // Upload images
      if (pickedFiles[0]) {
        await uploadImage(pickedFiles[0], 'id-card/image');
      }
      if (pickedFiles[1]) {
        await uploadImage(pickedFiles[1], 'portrait/image');
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
    setPickedFiles([null, null]);
    setFormData({
      fullName: { value: '', error: false, errorMessage: '' },
      phoneNumber: { value: '', error: false, errorMessage: '' },
      email: { value: '', error: false, errorMessage: '' },
      idCard: { error: false, errorMessage: '' },
      selfie: { error: false, errorMessage: '' },
    });
    setUploading(false);
    setResponseMessage(null);
    setLoading(false);
  };

  const handleSkip = () => {
    resetFormState();
    router.push('/profile');
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
          <FontAwesome name="angle-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ยืนยันตัวตน</Text>
        <TouchableOpacity onPress={handleSkip}>
          <View style={styles.flagContainer}>
            <Text style={styles.flag}>ข้าม</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Progress Bar Component */}
      <ProgressBar animation={progressAnimation} styles={styles}/>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Shield Section */}
        <View style={styles.privacySection}>
          <View style={styles.shieldIcon}>
            <Image
              source={require('../assets/images/images/images/image1.png')}
              style={{ height: 36, width: 36 }}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.privacyTitle}>ยืนยันตัวตนของคุณ</Text>
          <Text style={styles.privacySubtitle}>
            เพิ่มความน่าเชื่อถือให้โปรไฟล์ของคุณ และสร้างความปลอดภัยในคอมมูนิตี้ (ไม่บังคับ)
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>ชื่อ-นามสกุล (ตามบัตรประชาชน)</Text>
          
          <TextInputField
            field="fullName"
            label=""
            placeholder="กรอกชื่อจริงของคุณ"
            value={formData.fullName.value}
            error={formData.fullName.error}
            errorMessage={formData.fullName.errorMessage}
            onChangeText={(text) => updateFormField('fullName', { value: text })}
            style={styles.input}
               styles={styles}
          />
          
          <UploadBox
          styles={styles}
            index={0}
            label="บัตรประชาชน"
            placeholder="อัพโหลดรูปถ่ายบัตรประชาชน"
            subtitle="ถ่ายในที่แสงสว่างเพียงพอ เห็นหน้าชัดเจน"
            iconSource={require('../assets/images/images/images/image2.png')}
            pickedFile={pickedFiles[0]}
            onPress={() => pickImage(0)}
            error={formData.idCard.error}
            errorMessage={formData.idCard.errorMessage}
          />
          
          <UploadBox
            styles={styles}
            index={1}
            label="ภาพถ่ายยืนยันตัวตน"
            placeholder="ถ่ายรูปหน้าตรงกับบัตรประชาชน"
            subtitle="กรุณาถ่ายรูปให้ตรงกับบัตร เสื้อผ้าเรียบร้อย"
            iconSource={require('../assets/images/images/images/image3.png')}
            pickedFile={pickedFiles[1]}
            onPress={() => pickImage(1)}
            error={formData.selfie.error}
            errorMessage={formData.selfie.errorMessage}
          />

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <TextInputField
              field="phoneNumber"
              label="เบอร์โทรศัพท์"
              placeholder="เช่น 0891234567"
              value={formData.phoneNumber.value}
              error={formData.phoneNumber.error}
              errorMessage={formData.phoneNumber.errorMessage}
              onChangeText={(text) => {
                const filteredText = text.replace(/[^0-9]/g, '');
                if (filteredText.length <= 10) {
                  updateFormField('phoneNumber', { value: filteredText });
                }
              }}
              keyboardType="phone-pad"
              style={styles.textInput}
              styles={styles}
            />
            
            <TextInputField
              field="email"
              label="อีเมล"
              placeholder="example@email.com"
              value={formData.email.value}
              error={formData.email.error}
              errorMessage={formData.email.errorMessage}
              onChangeText={(text) => updateFormField('email', { value: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.textInput}
                 styles={styles}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'กำลังบันทึก...' : 'ยืนยันตัวตน'}
          </Text>
          {!isLoading && (
            <Image
              source={require('../assets/images/images/images/image5.png')}
              style={{ height: 16, width: 16 }}
              resizeMode="contain"
            />
          )}
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
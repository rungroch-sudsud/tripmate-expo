import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


import {
  getUserProfile,
  updateUserProfile,
  uploadIdCardImage,
  uploadPortraitImage,
  validateVerificationForm,
  processImagePickerResponse
} from '../../src/services/verificationService';

import styles from '../../src/css/account-verification_styles';

const PrivacySettings = () => {
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    idCard: null,
    selfie: null,
  });

  // Error state
  const [errors, setErrors] = useState({});

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const progressAnimation = useRef(new Animated.Value(66.66)).current;

  // Animation effect
  useEffect(() => {
    const animateProgress = () => {
      Animated.timing(progressAnimation, {
        toValue: 83.33,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };
    setTimeout(animateProgress, 300);
  }, []);

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const userProfile = await getUserProfile(userId);
      
      if (userProfile?.email) {
        setFormData(prev => ({
          ...prev,
          email: userProfile.email,
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [loadUserProfile])
  );

  // Generic image picker with better error handling
  const pickImage = useCallback((imageType) => {
    const options = {
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

    launchImageLibrary(options, (response) => {
      const imageName = imageType === 'idCard' ? 'id-card' : 'selfie';
      const processedImage = processImagePickerResponse(response, imageName);
      
      if (processedImage) {
        setFormData(prev => ({
          ...prev,
          [imageType]: processedImage,
        }));
        
        // Clear any existing error for this field
        setErrors(prev => ({
          ...prev,
          [imageType]: null,
        }));
      }
    });
  }, []);

  // Form field update handler
  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  }, [errors]);

  // Handle phone number with filtering
  const handlePhoneNumberChange = useCallback((text) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    if (filteredText.length <= 10) {
      updateFormField('phoneNumber', filteredText);
    }
  }, [updateFormField]);

  // Submit handler
  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate form
    const validation = validateVerificationForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Update profile data
      const profileData = {
        fullname: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };
      
      const profileResult = await updateUserProfile(profileData);
      if (!profileResult.success) {
        throw new Error('Failed to update profile');
      }

      // Upload images in parallel
      const uploadPromises = [];
      
      if (formData.idCard) {
        uploadPromises.push(uploadIdCardImage(formData.idCard));
      }
      
      if (formData.selfie) {
        uploadPromises.push(uploadPortraitImage(formData.selfie));
      }

      const uploadResults = await Promise.all(uploadPromises);
      
      // Check if any uploads failed
      const failedUploads = uploadResults.filter(result => !result.success);
      if (failedUploads.length > 0) {
        console.warn('Some image uploads failed:', failedUploads);
      }

      // Navigate to profile regardless of image upload status
      router.push('/profile');
      
    } catch (error) {
      console.error('Error submitting verification:', error);
      // You might want to show an error message to user here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation handlers
  const handleSkip = () => {
    router.push('/profile');
  };

  const handleGoBack = () => {
    router.push('/travel-style');
  };

  // Helper function to get error message
  const getErrorMessage = (field) => errors[field] || '';

  // Helper function to check if field has error
  const hasError = (field) => !!errors[field];

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
          {/* Full Name Input */}
          <Text style={styles.sectionLabel}>ชื่อ-นามสกุล (ตามบัตรประชาชน)</Text>
          <TextInput
            style={[
              styles.input,
              hasError('fullName') && { borderColor: 'red', borderWidth: 1 }
            ]}
            value={formData.fullName}
            onChangeText={(text) => updateFormField('fullName', text)}
            placeholder="กรอกชื่อจริงของคุณ"
            placeholderTextColor="#888"
          />
          {hasError('fullName') && (
            <Text style={styles.errorText}>{getErrorMessage('fullName')}</Text>
          )}

          {/* ID Card Upload */}
          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>บัตรประชาชน</Text>
            <TouchableOpacity
              style={[
                styles.uploadBox,
                hasError('idCard') && { borderColor: 'red', borderWidth: 1 }
              ]}
              onPress={() => pickImage('idCard')}
            >
              {formData.idCard ? (
                <Image source={{ uri: formData.idCard.uri }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.cameraIcon}>
                    <Image
                      source={require('../assets/images/images/images/image2.png')}
                      style={{ height: 24, width: 27 }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.uploadText}>อัพโหลดรูปถ่ายบัตรประชาชน</Text>
                  <Text style={styles.uploadSubtext}>
                    ถ่ายในที่แสงสว่างเพียงพอ เห็นหน้าชัดเจน
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {hasError('idCard') && (
              <Text style={styles.errorText}>{getErrorMessage('idCard')}</Text>
            )}
          </View>

          {/* Selfie Upload */}
          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>ภาพถ่ายยืนยันตัวตน</Text>
            <TouchableOpacity
              style={[
                styles.uploadBox,
                hasError('selfie') && { borderColor: 'red', borderWidth: 1 }
              ]}
              onPress={() => pickImage('selfie')}
            >
              {formData.selfie ? (
                <Image source={{ uri: formData.selfie.uri }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.personIcon}>
                    <Image
                      source={require('../assets/images/images/images/image3.png')}
                      style={{ height: 24, width: 24 }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.uploadText}>ถ่ายรูปหน้าตรงกับบัตรประชาชน</Text>
                  <Text style={styles.uploadSubtext}>
                    กรุณาถ่ายรูปให้ตรงกับบัตร เสื้อผ้าเรียบร้อย
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {hasError('selfie') && (
              <Text style={styles.errorText}>{getErrorMessage('selfie')}</Text>
            )}
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
              <TextInput
                style={[
                  styles.textInput,
                  hasError('phoneNumber') && { borderColor: 'red', borderWidth: 1 }
                ]}
                value={formData.phoneNumber}
                onChangeText={handlePhoneNumberChange}
                placeholder="เช่น 0891234567"
                placeholderTextColor="#C0C0C0"
                keyboardType="phone-pad"
              />
              {hasError('phoneNumber') && (
                <Text style={styles.errorText}>{getErrorMessage('phoneNumber')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>อีเมล</Text>
              <TextInput
                style={[
                  styles.textInput,
                  hasError('email') && { borderColor: 'red', borderWidth: 1 }
                ]}
                value={formData.email}
                onChangeText={(text) => updateFormField('email', text)}
                placeholder="example@email.com"
                placeholderTextColor="#C0C0C0"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {hasError('email') && (
                <Text style={styles.errorText}>{getErrorMessage('email')}</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isLoading || isSubmitting) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={isLoading || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันตัวตน'}
          </Text>
          {!isSubmitting && (
            <Image
              source={require('../assets/images/images/images/image5.png')}
              style={{ height: 16, width: 16 }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          <Image
            source={require('../assets/images/images/images/image4.png')}
            style={{ height: 12, width: 10.5 }}
            resizeMode="contain"
          />{' '}
          ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย
        </Text>
      </View>
    </View>
  );
};

export default PrivacySettings;
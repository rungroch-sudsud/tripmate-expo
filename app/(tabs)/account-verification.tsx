import React, { useState, useEffect, useRef, useCallback, } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native'
import { launchImageLibrary } from 'react-native-image-picker';
import { FontAwesome, } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { Animated } from 'react-native';
import { axiosInstance } from '../../src/lib/axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';
import styles from '../../src/css/account-verification_styles'

interface PrivacySettingsProps {}
type PickedFile = {
  uri: string;
  type: string;
  name: string;
  size?: number;
  base64Data?: string;
  isBase64?: boolean;
};
const PrivacySettings: React.FC<PrivacySettingsProps> = () => {
  const [pickedFile1, setPickedFile1] = useState<PickedFile | null>(null);
  const [pickedFile2, setPickedFile2] = useState<PickedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false)
  const [fullName, setfullName] = useState('')
  const [fullNameError, setFullNameError] = useState(false); 
  const [fullNameErrorMessage, setFullNameErrorMessage] = useState('');
const [phoneNumberError, setPhoneNumberError] = useState(false);
const [phoneNumberErrorMessage, setPhoneNumberErrorMessage] = useState('');
const [phoneNumber, setPhoneNumber] = useState('');
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState(false);
const [emailErrorMessage, setEmailErrorMessage] = useState(''); 
const [idCardError, setIdCardError] = useState(false);  // Error state for ID card upload
const [selfieError, setSelfieError] = useState(false);   // Error state for selfie upload
const [idCardErrorMessage, setIdCardErrorMessage] = useState('');  // Error message for ID card
const [selfieErrorMessage, setSelfieErrorMessage] = useState('');   // Error message for selfie


  const router = useRouter()

  const progressAnimation = useRef(new Animated.Value(66.66)).current;


  const fetchUserProfile=useCallback(async()=>{
     try{
      const userId=await AsyncStorage.getItem('userId')
       setLoading(true)
       const response=await axiosInstance.get(`/users/profile/${userId}`);
       const userProfile=response.data.data

       if(userProfile.email){
        setEmail(userProfile.email)
        console.log('Initial email set from profile:', userProfile.email);
       }

     }catch(error){
      console.error("Error in fetching user profile",error);
     }finally{
      setLoading(false)
     }
  },[])

    useFocusEffect(
      useCallback(()=>{
        fetchUserProfile()
    },[fetchUserProfile]))




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

  const pickImage1 = () => {
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
          
          setPickedFile1({
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
          return;
        }

        setPickedFile1({
          uri: pickedImage.uri,
          type: pickedImage.type ?? 'image/jpeg',
          name: pickedImage.fileName ?? `id-card-${Date.now()}.jpg`,
          size: pickedImage.fileSize,
        });

        console.log('🟢 Image 1 picked successfully:', {
          uri: pickedImage.uri.substring(0, 50) + '...',
          type: pickedImage.type,
          name: pickedImage.fileName,
          size: pickedImage.fileSize,
        });
      }
    });
  };

  const pickImage2 = () => {
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
          
          setPickedFile2({
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
          return;
        }

        setPickedFile2({
          uri: pickedImage.uri,
          type: pickedImage.type ?? 'image/jpeg',
          name: pickedImage.fileName ?? `id-card-${Date.now()}.jpg`,
          size: pickedImage.fileSize,
        });

        console.log('🟢 Image 2 picked successfully:', {
          uri: pickedImage.uri.substring(0, 50) + '...',
          type: pickedImage.type,
          name: pickedImage.fileName,
          size: pickedImage.fileSize,
        });
      }
    });
  };
  
  const validateEmail = (email: string): string | null => {
    const emailRegex = /\S+@\S+\.\S+/;
    
    if (!emailRegex.test(email)) {
      return 'กรุณากรอกอีเมลที่ถูกต้อง';
    }
  
    return null;  // No error
  };
  
  
  const validatePhoneNumber = (phone: string): string | null => {
    // Ensure the phone number has exactly 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    
    if (!phoneRegex.test(phone)) {
      return 'กรุณากรอกหมายเลขโทรศัพท์ที่ถูกต้อง (10 หลัก)';
    }
  
    return null; 
  };
  

  
  
  
  
  

  const handleSubmit = async () => {
    let hasError = false;

    const fullNameError = validateFullName(fullName);
  if (fullNameError) {
    setFullNameError(true);
    setFullNameErrorMessage(fullNameError); 
    hasError = true;
  } else {
    setFullNameError(false);
    setFullNameErrorMessage(''); 
  }


  const phoneError = validatePhoneNumber(phoneNumber);
  if (phoneError) {
    setPhoneNumberError(true);
    setPhoneNumberErrorMessage(phoneError); 
    hasError = true;
  } else {
    setPhoneNumberError(false);
    setPhoneNumberErrorMessage(''); 
  }

  
  const emailError = validateEmail(email);
  if (emailError) {
    setEmailError(true);
    setEmailErrorMessage(emailError);  // Set the error message
    hasError = true;
  } else {
    setEmailError(false);
    setEmailErrorMessage('');  // Clear the error message
  }
  
  if (!pickedFile1) {
    setIdCardError(true);
    setIdCardErrorMessage('กรุณาอัพโหลดรูปบัตรประชาชน');
    hasError = true;
  } else {
    setIdCardError(false);
    setIdCardErrorMessage('');
  }

  // Selfie Image Validation
  if (!pickedFile2) {
    setSelfieError(true);
    setSelfieErrorMessage('กรุณาอัพโหลดภาพถ่ายยืนยันตัวตน');
    hasError = true;
  } else {
    setSelfieError(false);
    setSelfieErrorMessage('');
  }

  // If there are any errors, prevent form submission
  if (hasError) {
    return;
  }
  
    if (hasError) {
      return; // prevent submit if any error
    }
  
    // Proceed with API submission
    console.log('All valid, submit form!');
    console.log(email);
    console.log(fullName);
    console.log(phoneNumber);

    console.log();
    
   try{
    
    const profileData = {
      fullname: fullName,
      email: email,
      phoneNumber: phoneNumber,
    };
    const profileResponse=await axiosInstance.patch(`/users/profile/${await AsyncStorage.getItem('userId')}`,profileData,{
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Profile updated successfully:", profileResponse.data);
   }catch(error){
    console.error("Error Updating User Profile: ",error);
   }

   try{
    if (!pickedFile1) {
      setResponseMessage('No image selected to upload');
      return;
    }

    console.log('🟢 Starting FormData fetch upload...');

    const formData = new FormData();
    
    if (pickedFile1.isBase64 && pickedFile1.base64Data) {
      // Convert base64 to Blob for FormData
      console.log('🟡 Converting base64 to Blob...');
      
      const byteCharacters = atob(pickedFile1.base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: pickedFile1.type });
      
      formData.append('file', blob, pickedFile1.name);
    } else {
      // Create proper file object for FormData
      const fileObj = {
        uri: pickedFile1.uri,
        type: pickedFile1.type,
        name: pickedFile1.name,
      } as any;

      formData.append('file', fileObj);
    }

    console.log('🟢 FormData upload with file:', {
      uri: pickedFile1.uri.substring(0, 50) + '...',
      type: pickedFile1.type,
      name: pickedFile1.name,
      size: pickedFile1.size,
    });

    setUploading(true);
    setResponseMessage(null);

    try {
      const response = await axiosInstance.patch(
        `/users/profile/id-card/image/${await AsyncStorage.getItem('userId')}`,
        formData,
        {
          headers: {
          },
        }
      );
    
      console.log('🔵 Axios response status:', response.status);
      console.log('🔵 Axios response headers:', response.headers);
      console.log('🔵 Axios response data:', response.data);
    
      setResponseMessage(`Success: ${response.data.message || 'Upload completed'}`);
    
    } catch (error) {
      console.log('🔴 Axios error:', error);
      
      if (error instanceof AxiosError) {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const data = error.response.data;
          
          setResponseMessage(`Error (${status}): ${data.message || 'Failed to upload'}`);
         
        } else {
          // Network error or other issues
          setResponseMessage(`Error: ${error.message || 'Network error'}`);
        
        }
      } else {
        // Handle non-axios errors
        setResponseMessage(`Error: ${String(error)}`);
       
      }
    } finally {
      setUploading(false);
    }
            
   }catch(error){
      console.error("Error Updating Id-Card Image: ",error);
      
   }

   try {
  if (!pickedFile2) {
    setResponseMessage('No image selected to upload');
    return;
  }

  console.log('🟢 Starting FormData axios upload...');

  const formData = new FormData();
  
  if (pickedFile2.isBase64 && pickedFile2.base64Data) {
    // Convert base64 to Blob for FormData
    console.log('🟡 Converting base64 to Blob...');
    
    const byteCharacters = atob(pickedFile2.base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: pickedFile2.type });
    
    formData.append('file', blob, pickedFile2.name);
  } else {
    // Create proper file object for FormData
    const fileObj = {
      uri: pickedFile2.uri,
      type: pickedFile2.type,
      name: pickedFile2.name,
    } as any;

    formData.append('file', fileObj);
  }

  console.log('🟢 FormData upload with file:', {
    uri: pickedFile2.uri.substring(0, 50) + '...',
    type: pickedFile2.type,
    name: pickedFile2.name,
    size: pickedFile2.size,
  });

  setUploading(true);
  setResponseMessage(null);

  try {
    const response = await axiosInstance.patch(
      `/users/profile/portrait/image/${await AsyncStorage.getItem('userId')}`,
      formData,
      {
        headers: {
          // Don't set Content-Type header - axios will set it automatically for FormData
        },
      }
    );

    console.log('🔵 Axios response status:', response.status);
    console.log('🔵 Axios response headers:', response.headers);
    console.log('🔵 Axios response data:', response.data);

    setResponseMessage(`Success: ${response.data.message || 'Upload completed'}`);
  } catch (error) {
    console.log('🔴 Axios error:', error);
    
    if (error instanceof AxiosError) {
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        setResponseMessage(`Error (${status}): ${data.message || 'Failed to upload'}`);
       
      } else {
        // Network error or other issues
        setResponseMessage(`Error: ${error.message || 'Network error'}`);
     
      }
    } else {
      // Handle non-axios errors
      setResponseMessage(`Error: ${String(error)}`);
      
    }
  } finally {
    setUploading(false);
  }
} catch (error) {
  console.error("Error Updating Portrait Image: ", error);
}
    
   resetFormState()
   router.push('/profile')
      
  };

  const handleSkip = () => {
    console.log("Handle Go Back");
    resetFormState();

    router.push('/profile')
  }
  const handleGoBack = () => {
    console.log("Handle Go Back");
    resetFormState();
    router.push('/travel-style')
  }



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
  
    return null; // No errors
  };


  const resetFormState = () => {
    // Reset images
    setPickedFile1(null);
    setPickedFile2(null);
    
    // Reset form data
    setfullName('');
    setPhoneNumber('');
    setEmail('');
    
    // Reset error states
    setFullNameError(false);
    setFullNameErrorMessage('');
    setPhoneNumberError(false);
    setPhoneNumberErrorMessage('');
    setEmailError(false);
    setEmailErrorMessage('');
    setIdCardError(false);
    setIdCardErrorMessage('');
    setSelfieError(false);
    setSelfieErrorMessage('');
    
    // Reset other states
    setUploading(false);
    setResponseMessage(null);
    setLoading(false);
  };
  


  return (
    <View style={styles.container}>
      {/* Header */}
      <Stack.Screen options={{ headerShown: false }} />
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
          <Text style={styles.sectionLabel}>ชื่อ-นามสกุล (ตามบัตรประชาชน)</Text>
          <TextInput
    style={[
      styles.input,
      fullNameError && { borderColor: 'red', borderWidth: 1 }
    ]}
    value={fullName}
    onChangeText={setfullName}
    placeholder="กรอกชื่อจริงของคุณ"
    placeholderTextColor="#888"
  />

  {/* Show error message if fullNameError is true */}
  {fullNameError && (
    <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
      {fullNameErrorMessage}
    </Text>
  )}


        {/* ID Card Upload */}
<View style={styles.uploadSection}>
  <Text style={styles.uploadLabel}>บัตรประชาชน</Text>
  <TouchableOpacity
    style={[
      styles.uploadBox,
      idCardError && { borderColor: 'red', borderWidth: 1 }
    ]}
    onPress={pickImage1}
  >
    {pickedFile1 ? (
      <Image source={{ uri: pickedFile1.uri }} style={styles.uploadedImage} />
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

  {/* Show error message for ID card upload */}
  {idCardError && (
    <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
      {idCardErrorMessage}
    </Text>
  )}
</View>

{/* Selfie Upload */}
<View style={styles.uploadSection}>
  <Text style={styles.uploadLabel}>ภาพถ่ายยืนยันตัวตน</Text>
  <TouchableOpacity
    style={[
      styles.uploadBox,
      selfieError && { borderColor: 'red', borderWidth: 1 }
    ]}
    onPress={pickImage2}
  >
    {pickedFile2 ? (
      <Image source={{ uri: pickedFile2.uri }} style={styles.uploadedImage} />
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

  {/* Show error message for Selfie upload */}
  {selfieError && (
    <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
      {selfieErrorMessage}
    </Text>
  )}
</View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
              <TextInput
    style={[
      styles.textInput,
      phoneNumberError && { borderColor: 'red', borderWidth: 1 }
    ]}
    value={phoneNumber}
    onChangeText={(text) => {
      // Allow only digits (0-9)
      const filteredText = text.replace(/[^0-9]/g, '');

      if(filteredText.length<=10){
        setPhoneNumber(filteredText);
      }
    }}
    placeholder="เช่น 0891234567"
    placeholderTextColor="#C0C0C0"
    keyboardType="phone-pad"
  />

  {/* Show error message if phoneNumberError is true */}
  {phoneNumberError && (
    <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
      {phoneNumberErrorMessage}
    </Text>
  )}

            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>อีเมล</Text>
              <TextInput
    style={[
      styles.textInput,
      emailError && { borderColor: 'red', borderWidth: 1 }
    ]}
    value={email}
    onChangeText={setEmail}
    placeholder="example@email.com"
    placeholderTextColor="#C0C0C0"
    keyboardType="email-address"
    autoCapitalize="none"
  />

  {/* Show error message if emailError is true */}
  {emailError && (
    <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
      {emailErrorMessage}
    </Text>
  )}
            </View>
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
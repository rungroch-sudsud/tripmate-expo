import React, { useState,useEffect,useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { FontAwesome,MaterialCommunityIcons } from '@expo/vector-icons';
import {  useRouter,Stack } from 'expo-router';
import { Animated } from 'react-native';
import {axiosInstance} from '../lib/axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
interface PrivacySettingsProps {}

const PrivacySettings: React.FC<PrivacySettingsProps> = () => {
  const [isLoading,setLoading]=useState(false)
  const [fullName,setfullName]=useState('')

    const router=useRouter()

    const progressAnimation = useRef(new Animated.Value(66.66)).current;

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
  const [idCardImage, setIdCardImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const selectImage = (type: 'idCard' | 'selfie') => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (type === 'idCard') {
          setIdCardImage(imageUri || null);
        } else {
          setSelfieImage(imageUri || null);
        }
      }
    });
  };


  const handleSubmit=async()=>{
       if(!idCardImage || !selfieImage || !phoneNumber || !email || !fullName){
        Alert.alert("กรุณากรอกข้อมูลให้ครบถ้วน","Please fill in all required information")
        return
       }
       setLoading(true)

       try{
        const userId=await AsyncStorage.getItem('userId')
        if(!userId){
          Alert.alert("ข้อผิดพลาด","ไม่พบข้อมูลผู้ใช้")
          router.push('/login')
        }

        const idCardFormData=new FormData();
        idCardFormData.append('file',{
          uri:idCardImage,
          type:'image/jpeg',
          name:'id-card.jpg',
        }as any);

        const idCardResponse=await axiosInstance.patch(`/users/profile/id-card/image/${userId}`,idCardFormData,{
          headers:{
            'Content-Type':'multipart/form-data'
          }
        })

        const portraitFormData=new FormData();
        portraitFormData.append('file',{
          uri:selfieImage,
          type:'image/jpeg',
          name:'portrait.jpg',
        }as any)

        const portraitResponse=await axiosInstance.patch(`/users/profile/`)


       }

       catch(error){
        console.error("Error submitting Verification: ",error);
       }

       finally{
        setLoading(false)
       }
  }


  const handleGoBack=()=>{
    console.log("Handle Go Back");
    router.back()
    
  }

  

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <FontAwesome name="angle-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ยืนยันตัวตน</Text>
       
       <TouchableOpacity onPress={handleGoBack}>
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
        source={require('../assets/images/images/image1.png')} // Replace with your image path
        style={{height:36,width:36}}
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
        style={styles.input}
       // value={username}
       // onChangeText={setUsername}
        placeholder="กรอกชื่อจริงของคุณ"
        placeholderTextColor="#888"
      />
       
          {/* ID Card Upload */}
          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>บัตรประชาชน</Text>
            <TouchableOpacity 
              style={styles.uploadBox}
              onPress={() => selectImage('idCard')}
            >
              {idCardImage ? (
                <Image source={{ uri: idCardImage }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.cameraIcon}>
                  <Image
        source={require('../assets/images/images/image2.png')} // Replace with your image path
        style={{height:24,width:27}}
        resizeMode="contain"
      />
                  </View>
                  <Text style={styles.uploadText}>
                  อัพโหลดรูปถ่ายบัตรประชาชน
                  </Text>
                  <Text style={styles.uploadSubtext}>
                  ถ่ายในที่แสงสว่างเพียงพอ เห็นหน้าชัดเจน
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Selfie Upload */}
          <View style={styles.uploadSection}>
            <Text style={styles.uploadLabel}>ภาพถ่ายยืนยันตัวตน</Text>
            <TouchableOpacity 
              style={styles.uploadBox}
              onPress={() => selectImage('selfie')}
            >
              {selfieImage ? (
                <Image source={{ uri: selfieImage }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.personIcon}>
                  <Image
        source={require('../assets/images/images/image3.png')} // Replace with your image path
        style={{height:24,width:24}}
        resizeMode="contain"
      />
                  </View>
                  <Text style={styles.uploadText}>
                    ถ่ายรูปหน้าตรงกับบัตรประชาชน
                  </Text>
                  <Text style={styles.uploadSubtext}>
                    กรุณาถ่ายรูปให้ตรงกับบัตร เสื้อผ้าเรียบร้อย
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View style={styles.contactSection}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
              <TextInput
                style={styles.textInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="เช่น 0891234567"
                placeholderTextColor="#C0C0C0"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>อีเมล</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                placeholderTextColor="#C0C0C0"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomSection}>
  <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
    <Text style={styles.submitButtonText}>ยืนยันตัวตน</Text>
    <Image
        source={require('../assets/images/images/image5.png')} // Replace with your image path
        style={{height:16,width:16}}
        resizeMode="contain"
      />
  </TouchableOpacity>
  <Text style={styles.disclaimer}>
  <Image
        source={require('../assets/images/images/image4.png')} // Replace with your image path
        style={{height:12,width:10.5}}
        resizeMode="contain"
      /> ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย
  </Text>
</View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  
   
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -5,
  },
  backIcon: {
    fontSize: 18,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily:'Inter_700Bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginBottom:12,
    marginTop:12
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  flagContainer: {
    padding: 8,
  },
  flag: {
    fontSize: 16,
    color:'#4F46E5',
    fontFamily:'Inter_600SemiBold',

  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  privacySection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  shieldIcon: {
    width: 68,
    height: 68,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  shieldEmoji: {
    fontSize: 28,
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  privacySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '300',
    color: '#374151',
    marginBottom: 8,
  },
  uploadSection: {
    marginTop:16,
    marginBottom: 12,
    height:208
  },
  uploadLabel: {
    fontSize: 14,
   
    color: '#374151',
    marginBottom: 8,
    fontFamily:'Inter_500Medium'
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minHeight: 120,
    backgroundColor:'#F9FAFB80'
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  cameraIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  personIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraEmoji: {
    fontSize: 20,
  },
  personEmoji: {
    fontSize: 20,
  },
  uploadText: {
    fontSize: 14,
    fontFamily:"Inter_500Medium",
    color: '#374151',
    marginBottom: 4,
    lineHeight: 14,
  },
  uploadSubtext: {
    fontSize: 12,
    fontFamily:'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 12,
  },
  uploadedImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  contactSection: {
    paddingTop: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily:'Inter_500Medium',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB80',
  },
  bottomSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
   
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily:'Inter_500Medium',
    color: '#FFFFFF',
    marginRight: 8,
  },
  checkMark: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  
    fontFamily:'Inter_400Regular',
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
     borderRadius: 100,
   },
   input:{
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
    borderRadius: 12,
    fontSize:16,
    backgroundColor:'#F9FAFB80',
    padding: 24,
    alignItems: 'center',
    height: 58,
   }
});

export default PrivacySettings;
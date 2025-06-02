import React, {useRef, useEffect} from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../app/firebaseConfig.js';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,

} from 'react-native';
import { Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter,Stack } from 'expo-router';
import {axiosInstance} from '../lib/axios'


WebBrowser.maybeCompleteAuthSession();


const Login = () => {
    const router = useRouter();
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {

 
    
    const animateProgress = () => {
      Animated.timing(progressAnimation, {
        toValue: 33.33,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    setTimeout(animateProgress, 300);
  }, []);

  const handleWebGoogleSignIn=async ()=>{
    const provider=new GoogleAuthProvider()

    try{
       const result=await signInWithPopup(auth,provider)
       const user=result.user

       console.log("Google Sign In success: ",{
        uid:user.uid,
        email:user.email,
        displayName:user.displayName
       });

       try{
        const profileData = {
          userId: user.uid,
          profileImageUrl: "N/A",
          idCardImageUrl: "N/A",
          portraitImageUrl: "N/A",
          travelStyles: ["N/A"],
          nickname: "N/A",
          lineId: "N/A",
          fullname: user.displayName,
          facebookUrl: "N/A",
          email: user.email,
          destinations: ["N/A"],
          age: -999,
          phoneNumber: "N/A",
          gender: "ชาย"
        };
        
           const response=await axiosInstance.post('/users/profile',profileData)
           if(response.status==201){
            console.log("User Profile Created Successfully ",response.data);
            console.log(response.data.data.userId);

            await AsyncStorage.setItem('userId',response.data.data.userId);
            router.push('/travel-style')
            
            
           }
       }catch(profileError){
          console.error("Failed to create user profile: ",profileError);
          
       }
       

    }
    catch(error){
        console.error("Firebase Sign In Failed ",error);
        
    }

   }
  


  const handleBackPress = () => {
    // Handle back button press
   // console.log('Back button pressed');
   router.push('/')
  };

  return (
    
    <SafeAreaView style={styles.container}>
     
     <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <FontAwesome name="angle-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>เข้าสู่ระบบ</Text>
        <View style={styles.placeholder} />
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

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logo} />
        </View>

        {/* App Name */}
        <Text style={styles.appName}>TripBuddy</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>หาเพื่อนเที่ยวที่ใช้ในสไตล์คุณ</Text>

        {/* Google Sign In Button */}
        <TouchableOpacity style={styles.googleButton} onPress={handleWebGoogleSignIn}>
          <View style={styles.googleButtonContent}>
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>เข้าสู่ระบบด้วย Google</Text>
          </View>
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <Text style={styles.termsText}>
          
          <Text
  numberOfLines={1}
  style={{
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    flexShrink: 1,
  }}
>
  เข้าสู่ระบบด้วย Google เพื่อความสะดวกและปลอดภัย
</Text>
{'\n'}{'\n'}{'\n'}{'\n'}
<Text>การเข้าสู่ระบบเป็นการยอมรับ 
 </Text>{' '}
          <Text style={styles.linkText}>นโยบายความเป็นส่วนตัว</Text> 
          {'\n'}
          และ{' '}
          <Text style={styles.linkText}>ข้อกําหนดการใช้งาน</Text> และ ของเรา
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  backArrow: {
    fontSize: 20,
    color: '#333333',
    fontWeight: '600',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center'
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
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4285F4',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,

  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 60,
    textAlign: 'center',
  
  },
  googleButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 5,
    minWidth: 400,
    borderWidth: 1,
    borderColor: '#dadce0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconContainer: {
    width: 30,
    height: 30,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 18,
    fontWeight: '500',
  
  },
  termsText: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  
  },
  linkText: {
    color: '#4285F4',
    textDecorationLine: 'underline',

  },
});

export default Login;
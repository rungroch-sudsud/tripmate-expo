import React, {useRef, useEffect,useState} from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../app/firebaseConfig.js';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup,getAuth } from 'firebase/auth';
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
import axios from 'axios'
import {useFonts} from 'expo-font'

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const [fontsLoaded] = useFonts({
    'CustomFont': require('../assets/fonts/InterTight-Black.ttf'),
    'InterTight-SemiBold': require('../assets/fonts/InterTight-SemiBold.ttf'),
    'InterTight-Regular':require('../assets/fonts/InterTight-Regular.ttf')
  });
    const router = useRouter();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();  
        if (idToken) {
          await AsyncStorage.setItem('googleIdToken', idToken);
        }
  
        const googleAccessToken = await AsyncStorage.getItem('googleAccessToken');
        if (googleAccessToken) {
          await AsyncStorage.setItem('googleAccessToken', googleAccessToken);
        }
  
      
        await AsyncStorage.setItem('userId', user.uid);
        const userId=await AsyncStorage.getItem('userId')
        console.log(userId);
        
        
        setIsAuthenticated(true);
        router.push('/findTrips');  
      } else {
   
        setIsAuthenticated(false);
      }
    });
  
    return unsubscribe; 
  }, [auth, router]);
  
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

  const handleWebGoogleSignIn = async (): Promise<any> => {
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleAccessToken = credential?.accessToken;
      
      // Store tokens
      if (googleAccessToken) {
        await AsyncStorage.setItem('googleAccessToken', googleAccessToken);
      }
      const idToken = await user.getIdToken();
      if (idToken) {
        await AsyncStorage.setItem('googleIdToken', idToken);
      }
      
      console.log("Google Sign In success: ", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
      
      // Direct API call without auth state listener
      try {
        console.log('Making API request...');
        
        const profileData = {
          userId: user.uid,
          profileImageUrl: "N/A",
          idCardImageUrl: "N/A",
          portraitImageUrl: "N/A",
          travelStyles: ["N/A"],
          nickname: "N/A",
          lineId: "N/A",
          fullname: user.displayName || "N/A",
          facebookUrl: "N/A",
          email: user.email || "N/A",
          destinations: ["N/A"],
          age: -999,
          phoneNumber: "N/A",
          gender: "ชาย",
        };
        
        const response = await axiosInstance.post('/users/profile', profileData);
        
        if (response.status === 201) {
          console.log("User Profile Created Successfully", response.data);
          await AsyncStorage.setItem('userId', response.data.data.userId);
          router.push('/travel-style');
          return response.data;
        }
      } catch (apiError: any) {
        if (axios.isAxiosError(apiError)) {
          if (apiError.response?.status === 409) {
            console.log("User already exists, proceeding...");
            await AsyncStorage.setItem('userId', user.uid);
            router.push('/travel-style');
            return { message: 'User exists' };
          } else if (apiError.response?.status === 400) {
            await AsyncStorage.setItem('userId', user.uid);
            console.log(user.uid);
            const storedUserId = await AsyncStorage.getItem('userId');
            console.log(storedUserId);
            console.log(googleAccessToken);
            console.log(idToken);
            
            
            router.push('/travel-style');
            return { message: 'User profile incomplete' };
          } else {
            console.error("API Error:", apiError.response?.data || apiError.message);
            throw apiError;
          }
        } else {
          console.error("Non-Axios API Error:", apiError);
          throw apiError;
        }
      }
      
        } catch (error: any) {
        if (error?.code) {
        console.error("Firebase Auth Error:", error.code, error.message);
        
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            console.log("User cancelled sign-in");
            break;
          case 'auth/popup-blocked':
            console.log("Popup was blocked by browser");
            break;
          default:
            console.error("Authentication failed:", error.message);
        }
      } else {
        console.error("Sign In Process Failed:", error);
      }
      throw error;
    }
  };



  const term=()=>{
    console.log("Term");
    
  }
  
  


  const handleBackPress = () => {
    // Handle back button press
   // console.log('Back button pressed');
   router.push('/')
  };
  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }


  return (
    
    <SafeAreaView style={styles.container}>
     
     <Stack.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' }, }} />
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
        <Text style={styles.appName}>TripMate</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>หาเพื่อนเที่ยวที่ใช่ในสไตล์คุณ</Text>

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
    color: '#6B7280',
    textAlign: 'center',
    flexShrink: 1,
    fontFamily:'InterTight-Regular'
  }}
>
  เข้าสู่ระบบด้วย Google เพื่อความสะดวกและปลอดภัย
</Text>
{'\n'}{'\n'}{'\n'}{'\n'}
<Text style={{fontFamily:"InterTight-Regular",fontSize:12,color:"#6B7280"}}>การเข้าสู่ระบบเป็นการยอมรับ 
 </Text>
          <TouchableOpacity onPress={term}><Text style={styles.linkText}>นโยบาย ความเป็นส่วนตัวข้อกำหนดการใช้งาน</Text></TouchableOpacity> และ ของเรา
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
    fontFamily:"InterTight-Bold"
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
    flex: 1,
     fontStyle:'normal',
    textAlign: 'center',
    fontSize:18,
    fontWeight:500,
    color:'#1F2937'
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
    width: 96,
    height: 96,
    borderRadius: 9999,
    backgroundColor: '#3B82F6',
  },
  appName: {
    fontSize: 24,
    fontFamily:"InterTight-SemiBold",
    color: '#333333',
    marginBottom: 8,


  },
  subtitle: {
    
    fontFamily:"InterTight-Regular",
    marginBottom: 60,
    textAlign: 'center',
    color:"#6B7280",
    fontSize:14
  
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
    width:350,
    height:58
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
    color: '#374151',
    fontSize: 16,
    fontFamily:'InterTight-SemiBold',
    lineHeight:16,
  
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 12,
    paddingHorizontal: 20,
  
  },
  linkText: {
    color: '#3B82F6',
    fontFamily:'InterTight-Regular',
    fontSize:12

  },
});

export default Login;
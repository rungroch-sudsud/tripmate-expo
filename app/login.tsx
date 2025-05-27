import React, {useRef, useEffect} from 'react';
import { getApps } from 'firebase/app';
import auth from '@react-native-firebase/auth'
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,

} from 'react-native';
import { Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axiosInstance from './lib/axios';
import TravelStyleScreen from './travel_style_screen'




const Login = () => {
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    GoogleSignin.configure({
    webClientId: '189024899880-2755tl0jueo8p288mmu2rhkirqergvui.apps.googleusercontent.com', // From Firebase Console > Project > OAuth 2.0 Web client
  });
    
    const animateProgress = () => {
      Animated.timing(progressAnimation, {
        toValue: 33.33,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    setTimeout(animateProgress, 300);
  }, []);

  const handleWebGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();

    const userId = user.uid;

    const response = await axiosInstance.post(
      '/users/profile',
      {
        // id: userId,  // uncomment only if backend requires it explicitly
        userId: userId,
        nickname: user.displayName || '',
        email: user.email || '',
        fullname: user.displayName || '',
        travelStyles: [],
        destinations: [],
        gender: '',
        age: null,
        lineId: '',
        facebookUrl: ''
      },
      {
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );

    console.log('Backend response:', response.data);

    if (response.status === 201) {
      const myJwt = response.data.token || response.data.jwt || response.data.accessToken;
      console.log('Backend JWT:', myJwt);
    }

  } catch (error) {
    console.error('Web login failed:', error);
  }
};


  const handleBackPress = () => {
    // Handle back button press
    console.log('Back button pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
     
      
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
    fontFamily: 'Inter_400Regular',
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
    fontFamily: 'Inter_600SemiBold',
   
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
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
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
    backgroundColor: '#4285F4',
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
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 60,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
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
    fontFamily: 'Inter_600SemiBold',
  },
  termsText: {
    fontSize: 15,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    fontFamily: 'Inter_400Regular',
  },
  linkText: {
    color: '#4285F4',
    textDecorationLine: 'underline',
     fontFamily: 'Inter_400Regular',
  },
});

export default Login;





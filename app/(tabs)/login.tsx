import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Image,
  Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import styles from '../../css/login_styles';
import { NAVIGATION_ROUTES } from '../../features/user/services/userServices';
import {
  storeUserTokens,
  clearStoredTokens,
  createUserProfile,
  getUserProfile
} from '../../features/auth/authService';
import ProgressBar from '../../components/ProgressBar';

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const auth = getAuth();

  // Memoized navigation helper
  const navigateToRoute = useCallback((route) => {
    setTimeout(() => router.push(route), 100);
  }, [router]);

  // Memoized error handler
  const handleAuthError = useCallback(async (error, context) => {
    console.error(`${context} error:`, error);
    await clearStoredTokens();
    setIsLoading(false);
  }, []);

  // Memoized user authentication flow
  const processUserAuth = useCallback(async (user, accessToken) => {
    const stored = await storeUserTokens(user, accessToken);
    if (!stored) {
      throw new Error('Token storage failed');
    }
    return stored;
  }, []);

  // Memoized profile creation flow
  const handleProfileCreation = useCallback(async (user) => {
    const { success, route } = await createUserProfile(user);
    if (success) {
      navigateToRoute(route);
    } else {
      throw new Error('Profile creation failed');
    }
  }, [navigateToRoute]);

  // Memoized existing user flow
  const handleExistingUser = useCallback(async (user) => {
    await processUserAuth(user, undefined);
    
    const profile = await getUserProfile(user.uid);
    console.log(profile);
    
    if (profile?.age !== -999) {
      navigateToRoute(NAVIGATION_ROUTES.FIND_TRIPS);
    }
  }, [processUserAuth, navigateToRoute]);

  // Google Sign-In Handler
  const handleGoogleSignIn = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);

      await processUserAuth(user, credential?.accessToken);
      await handleProfileCreation(user);

    } catch (error) {
      await handleAuthError(error, 'Google sign-in');
    }finally {
  setIsLoading(false); // Ensure loading is cleared
}
  }, [isLoading, auth, processUserAuth, handleProfileCreation, handleAuthError]);

  // Auto-authenticated user handler
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && !isLoading) {
        try {
          await handleExistingUser(user);
        } catch (error) {
          await handleAuthError(error, 'Auto-authentication');
        }
      }
    });

    return unsubscribe;
  }, [auth, isLoading, handleExistingUser, handleAuthError]);

  // Progress animation on load
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: 33.33,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progressAnimation]);

  // Render Google button content
  const renderGoogleButtonContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color="#374151" />;
    }

    return (
      <>
        <View style={styles.googleIconContainer}>
           <Image 
                  source={require('../assets/images/images/images/image31.png')}
                  style={styles.googleIcon}
                />
        </View>
        <Text style={styles.googleButtonText}>เข้าสู่ระบบด้วย Google</Text>
      </>
    );
  };

  // Render terms and conditions
const renderTermsText = () => (
  <Text style={styles.termsText}>
    <Text style={styles.descriptionText}>
      เข้าสู่ระบบด้วย Google เพื่อความสะดวกและปลอดภัย
    </Text>
    {'\n\n'}

    <Text style={styles.termsBaseText}>
      การเข้าสู่ระบบเป็นการยอมรับ{' '}
      <TouchableOpacity onPress={() => router.push('/Privacy-Policy')}>
        <Text style={styles.linkText}>นโยบาย ความเป็นส่วนตัว</Text>
      </TouchableOpacity>
    </Text>

    {'\n'}

    <Text style={styles.termsBaseText}>
      <TouchableOpacity onPress={() => router.push('/Privacy-Policy')}>
        <Text style={styles.linkText}>ข้อกำหนดการใช้งาน</Text>
      </TouchableOpacity>{' '}
      และ ของเรา
    </Text>
  </Text>
);


  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />

      <View style={styles.header}>
        <Text style={styles.headerText}>เข้าสู่ระบบ</Text>
      </View>

      <ProgressBar animation={progressAnimation} styles={styles} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo} />
        </View>

    <Text 
  style={[
    styles.appName,
    Platform.OS === 'web' && {
      background: 'linear-gradient(90deg, #585DDB 0%, #FF956E 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }
  ]}
>
  TripMate
</Text>
        <Text style={styles.subtitle}>หาเพื่อนเที่ยวที่ใช่ในสไตล์คุณ</Text>

        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.disabledButton]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          <View style={styles.googleButtonContent}>
            {renderGoogleButtonContent()}
          </View>
        </TouchableOpacity>

        {renderTermsText()}
      </View>
    </SafeAreaView>
  );
};

export default Login;
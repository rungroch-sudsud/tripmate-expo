import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Animated } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { axiosInstance } from '../lib/axios';
import axios from 'axios';
import { useFonts } from 'expo-font';
import styles from '../(tabs)/css/login_styles'
WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEYS = {
  GOOGLE_ID_TOKEN: 'googleIdToken',
  GOOGLE_ACCESS_TOKEN: 'googleAccessToken',
  USER_ID: 'userId',
};

const API_STATUS = {
  SUCCESS: 201,
  CONFLICT: 409,
  BAD_REQUEST: 400,
};

const AUTH_ERRORS = {
  POPUP_CLOSED: 'auth/popup-closed-by-user',
  POPUP_BLOCKED: 'auth/popup-blocked',
  NETWORK_ERROR: 'auth/network-request-failed',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
};

const Login = () => {
  // State management
  const [fontsLoaded] = useFonts({
    'CustomFont': require('../assets/fonts/InterTight-Black.ttf'),
    'InterTight-SemiBold': require('../assets/fonts/InterTight-SemiBold.ttf'),
    'InterTight-Regular': require('../assets/fonts/InterTight-Regular.ttf')
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false); // Add this flag
  const [navigationHandled, setNavigationHandled] = useState(false); // Add this flag to prevent auth listener interference

  const router = useRouter();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const authInstance = getAuth();

  // Utility functions
  const clearStoredTokens = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.GOOGLE_ID_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_ID),
      ]);
    } catch (error) {
      console.warn('Failed to clear stored tokens:', error);
    }
  }, []);

  const storeUserTokens = useCallback(async (user, googleAccessToken) => {
    try {
      const promises = [AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid)];
      
      if (googleAccessToken) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN, googleAccessToken));
      }

      const idToken = await user.getIdToken();
      if (idToken) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_ID_TOKEN, idToken));
      }

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Failed to store user tokens:', error);
      return false;
    }
  }, []);

  const showErrorAlert = useCallback((title, message, retry = null) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'ตกลง', style: 'default' },
        ...(retry ? [{ text: 'ลองใหม่', onPress: retry, style: 'default' }] : []),
      ]
    );
  }, []);

  // Auth state listener - only for detecting existing authentication on page load
  useEffect(() => {
    let isMounted = true;
    let hasCheckedInitialAuth = false;

    const unsubscribe = authInstance.onAuthStateChanged(
      async (user) => {
        if (!isMounted) return;

        try {
          if (user && !isLoginInProgress && !hasCheckedInitialAuth && !navigationHandled) {
            // This handles the case where user is already authenticated when visiting login page
            hasCheckedInitialAuth = true;
            const tokenStored = await storeUserTokens(user, null);
            if (tokenStored) {
             
              
             try{
              const response=await axiosInstance.get(`/users/profile/${user.uid}`)
              console.log(response.data.data);
              if(response.data.data.age!==-999){
                setIsAuthenticated(true);
                console.log("Auth state listener: Redirecting existing user to /findTrips");
                router.push('/findTrips');
              }
             }catch{
              setIsAuthenticated(false)
              await clearStoredTokens();
             }
            } else {
              throw new Error('Failed to store user tokens');
            }
          } else if (!user && !isLoginInProgress && !navigationHandled) {
            setIsAuthenticated(false);
            await clearStoredTokens();
          }
          
          // Mark that we've checked initial auth state
          if (!hasCheckedInitialAuth) {
            hasCheckedInitialAuth = true;
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          if (!isLoginInProgress) {
            setError('เกิดข้อผิดพลาดในการยืนยันตัวตน');
          }
        }
      },
      (error) => {
        if (!isMounted) return;
        console.error('Auth state listener error:', error);
        if (!isLoginInProgress) {
          setError('เกิดข้อผิดพลาดในระบบยืนยันตัวตน');
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [authInstance, router, storeUserTokens, clearStoredTokens, isLoginInProgress, navigationHandled]);

  // Progress animation
  useEffect(() => {
    const animateProgress = () => {
      Animated.timing(progressAnimation, {
        toValue: 33.33,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    const timer = setTimeout(animateProgress, 300);
    return () => clearTimeout(timer);
  }, [progressAnimation]);

  // API call with retry logic
  const createUserProfile = useCallback(async (user, googleAccessToken) => {
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

    try {
      console.log("Creating user profile...");
      const response = await axiosInstance.post('/users/profile', profileData, {
        timeout: 10000, // 10 second timeout
      });

      if (response.status === API_STATUS.SUCCESS) {
        console.log("User Profile Created Successfully", response.data);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, response.data.data.userId);
        return { success: true, route: '/travel-style', isNewUser: true };
      }
    } catch (apiError) {
      if (axios.isAxiosError(apiError)) {
        switch (apiError.response?.status) {
          case API_STATUS.CONFLICT:
            console.log("User already exists, checking if profile is complete...");
            await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid);
            // User exists but we need to check if they need to complete profile setup
            return { success: true, route: '/findTrips', isExistingUser: true };
          
          case API_STATUS.BAD_REQUEST:
            try{
              const response=await axiosInstance.get(`/users/profile/${user.uid}`)
              if(response.data.data.age!==-999){
                console.log("Existing User profile, directing to find trips...");
                await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid);
                return { success: true, route: '/findTrips', isIncompleteProfile: true };
              }
              else{
                console.log("User profile incomplete, directing to travel-style...");
                await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid);
                return { success: true, route: '/travel-style', isIncompleteProfile: true };
              }
            }catch{
              console.log("User profile incomplete, directing to travel-style...");
              await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid);
              return { success: true, route: '/travel-style', isIncompleteProfile: true };
            }
          default:
            console.error("API Error:", apiError.response?.data || apiError.message);
            throw new Error(`API Error: ${apiError.response?.status || 'Unknown'}`);
        }
      } else {
        console.error("Non-Axios API Error:", apiError);
        throw apiError;
      }
    }
  }, []);

  // Main Google Sign In function with comprehensive error handling
  const handleWebGoogleSignIn = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setIsLoginInProgress(true); // Set login in progress flag
    setNavigationHandled(false); // Reset navigation flag
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await Promise.race([
        signInWithPopup(authInstance, provider),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Sign-in timeout')), 30000)
        )
      ]);

      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleAccessToken = credential?.accessToken;

      // Store tokens
      const tokenStored = await storeUserTokens(user, googleAccessToken);
      if (!tokenStored) {
        throw new Error('Failed to store authentication tokens');
      }

      console.log("Google Sign In success:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });

      // Create user profile with retry logic
      let profileResult;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          profileResult = await createUserProfile(user, googleAccessToken);
          break;
        } catch (profileError) {
          attempts++;
          console.warn(`Profile creation attempt ${attempts} failed:`, profileError);
          
          if (attempts === maxAttempts) {
            throw profileError;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      if (profileResult?.success) {
        console.log(`Navigation decision: ${profileResult.route}`, {
          isNewUser: profileResult.isNewUser,
          isExistingUser: profileResult.isExistingUser,
          isIncompleteProfile: profileResult.isIncompleteProfile
        });
        
        setNavigationHandled(true); // Mark that we're handling navigation
        
        // Add a small delay to ensure auth state is stable before navigation
        setTimeout(() => {
          router.push(profileResult.route);
        }, 100);
      } else {
        throw new Error('Failed to create user profile');
      }

    } catch (error) {
      console.error("Sign In Process Failed:", error);
      
      // Handle specific Firebase Auth errors
      if (error?.code) {
        switch (error.code) {
          case AUTH_ERRORS.POPUP_CLOSED:
            setError('การเข้าสู่ระบบถูกยกเลิก');
            break;
          case AUTH_ERRORS.POPUP_BLOCKED:
            showErrorAlert(
              'Popup ถูกบล็อก',
              'กรุณาอนุญาต popup ในเบราว์เซอร์แล้วลองใหม่',
              () => handleWebGoogleSignIn()
            );
            break;
          case AUTH_ERRORS.NETWORK_ERROR:
            setError('ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้');
            break;
          case AUTH_ERRORS.TOO_MANY_REQUESTS:
            setError('มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่');
            break;
          default:
            setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่');
        }
      } else if (error.message === 'Sign-in timeout') {
        setError('การเข้าสู่ระบบใช้เวลานานเกินไป กรุณาลองใหม่');
      } else {
        setError('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่');
      }

      // Clear any partial auth state
      await clearStoredTokens();
    } finally {
      setIsLoading(false);
      setIsLoginInProgress(false); // Reset login in progress flag
    }
  }, [isLoading, authInstance, storeUserTokens, createUserProfile, router, clearStoredTokens, showErrorAlert]);

  // Retry mechanism
  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setError(null);
      handleWebGoogleSignIn();
    } else {
      showErrorAlert(
        'ลองใหม่มากเกินไป',
        'กรุณารอสักครู่แล้วลองใหม่ หรือติดต่อทีมสนับสนุน'
      );
    }
  }, [retryCount, handleWebGoogleSignIn, showErrorAlert]);

  const handleTerms = useCallback(() => {
    console.log("Terms pressed");
    // Add navigation to terms page
  }, []);

  const handleBackPress = useCallback(() => {
    router.push('/');
  }, [router]);

  // Loading state
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>เข้าสู่ระบบ</Text>
      
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

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {retryCount < 3 && (
              <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>ลองใหม่</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Google Sign In Button */}
        <TouchableOpacity 
          style={[styles.googleButton, isLoading && styles.disabledButton]} 
          onPress={handleWebGoogleSignIn}
          disabled={isLoading}
        >
          <View style={styles.googleButtonContent}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#374151" />
            ) : (
              <>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>เข้าสู่ระบบด้วย Google</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <Text style={styles.termsText}>
          <Text style={styles.descriptionText}>
            เข้าสู่ระบบด้วย Google เพื่อความสะดวกและปลอดภัย
          </Text>
          {'\n\n\n\n'}
          <Text style={styles.termsBaseText}>การเข้าสู่ระบบเป็นการยอมรับ </Text>
          <TouchableOpacity onPress={handleTerms}>
            <Text style={styles.linkText}>นโยบายความเป็นส่วนตัวและข้อกำหนดการใช้งาน</Text>
          </TouchableOpacity>
          <Text style={styles.termsBaseText}> ของเรา</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Login;
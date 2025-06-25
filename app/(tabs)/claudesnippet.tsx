import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { axiosInstance } from '../lib/axios';
import axios from 'axios';
import { useFonts } from 'expo-font';

WebBrowser.maybeCompleteAuthSession();

// Constants
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

const ROUTES = {
  HOME: '/',
  FIND_TRIPS: '/findTrips',
  TRAVEL_STYLE: '/travel-style',
};

const Login = () => {
  // Fonts
  const [fontsLoaded] = useFonts({
    CustomFont: require('../assets/fonts/InterTight-Black.ttf'),
    'InterTight-SemiBold': require('../assets/fonts/InterTight-SemiBold.ttf'),
    'InterTight-Regular': require('../assets/fonts/InterTight-Regular.ttf'),
  });

  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);
  const [navigationHandled, setNavigationHandled] = useState(false);

  // Refs and instances
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
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN, googleAccessToken)
        );
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
    Alert.alert(title, message, [
      { text: 'ตกลง', style: 'default' },
      ...(retry ? [{ text: 'ลองใหม่', onPress: retry, style: 'default' }] : []),
    ]);
  }, []);

  const getProfileData = useCallback((user) => ({
    userId: user.uid,
    profileImageUrl: 'N/A',
    idCardImageUrl: 'N/A',
    portraitImageUrl: 'N/A',
    travelStyles: ['N/A'],
    nickname: 'N/A',
    lineId: 'N/A',
    fullname: user.displayName || 'N/A',
    facebookUrl: 'N/A',
    email: user.email || 'N/A',
    destinations: ['N/A'],
    age: -999,
    phoneNumber: 'N/A',
    gender: 'ชาย',
  }), []);

  // API functions
  const createUserProfile = useCallback(
    async (user, googleAccessToken) => {
      const profileData = getProfileData(user);

      try {
        console.log('Creating user profile...');
        const response = await axiosInstance.post('/users/profile', profileData, {
          timeout: 10000,
        });

        if (response.status === API_STATUS.SUCCESS) {
          console.log('User Profile Created Successfully', response.data);
          await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, response.data.data.userId);
          return { success: true, route: ROUTES.TRAVEL_STYLE, isNewUser: true };
        }
      } catch (apiError) {
        if (axios.isAxiosError(apiError)) {
          const status = apiError.response?.status;
          await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, user.uid);

          switch (status) {
            case API_STATUS.CONFLICT:
              console.log('User already exists, checking if profile is complete...');
              return { success: true, route: ROUTES.FIND_TRIPS, isExistingUser: true };
            case API_STATUS.BAD_REQUEST:
              console.log('User profile incomplete, directing to travel-style...');
              return { success: true, route: ROUTES.TRAVEL_STYLE, isIncompleteProfile: true };
            default:
              console.error('API Error:', apiError.response?.data || apiError.message);
              throw new Error(`API Error: ${status || 'Unknown'}`);
          }
        }
        console.error('Non-Axios API Error:', apiError);
        throw apiError;
      }
    },
    [getProfileData]
  );

  const performSignIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    const result = await Promise.race([
      signInWithPopup(authInstance, provider),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sign-in timeout')), 30000)
      ),
    ]);

    return {
      user: result.user,
      googleAccessToken: GoogleAuthProvider.credentialFromResult(result)?.accessToken,
    };
  }, [authInstance]);

  const handleAuthError = useCallback((error) => {
    console.error('Sign In Process Failed:', error);

    if (error?.code) {
      switch (error.code) {
        case AUTH_ERRORS.POPUP_CLOSED:
          setError('การเข้าสู่ระบบถูกยกเลิก');
          break;
        case AUTH_ERRORS.POPUP_BLOCKED:
          showErrorAlert(
            'Popup ถูกบล็อก',
            'กรุณาอนุญาต popup ในเบราว์เซอร์แล้วลองใหม่',
            handleWebGoogleSignIn
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
  }, [showErrorAlert]);

  // Main Google Sign In function
  const handleWebGoogleSignIn = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setIsLoginInProgress(true);
    setNavigationHandled(false);
    setError(null);

    try {
      // Step 1: Perform Google Sign In
      const { user, googleAccessToken } = await performSignIn();

      // Step 2: Store tokens
      const tokenStored = await storeUserTokens(user, googleAccessToken);
      if (!tokenStored) {
        throw new Error('Failed to store authentication tokens');
      }

      console.log('Google Sign In success:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });

      // Step 3: Create user profile with retry logic
      let profileResult;
      const maxAttempts = 3;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          profileResult = await createUserProfile(user, googleAccessToken);
          break;
        } catch (profileError) {
          console.warn(`Profile creation attempt ${attempt} failed:`, profileError);
          
          if (attempt === maxAttempts) {
            throw profileError;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      // Step 4: Navigate based on profile result
      if (profileResult?.success) {
        console.log(`Navigation decision: ${profileResult.route}`, {
          isNewUser: profileResult.isNewUser,
          isExistingUser: profileResult.isExistingUser,
          isIncompleteProfile: profileResult.isIncompleteProfile,
        });

        setNavigationHandled(true);
        setTimeout(() => router.push(profileResult.route), 100);
      } else {
        throw new Error('Failed to create user profile');
      }
    } catch (error) {
      handleAuthError(error);
      await clearStoredTokens();
    } finally {
      setIsLoading(false);
      setIsLoginInProgress(false);
    }
  }, [
    isLoading,
    performSignIn,
    storeUserTokens,
    createUserProfile,
    router,
    handleAuthError,
    clearStoredTokens,
  ]);

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
    console.log('Terms pressed');
    // TODO: Add navigation to terms page
  }, []);

  const handleBackPress = useCallback(() => {
    router.push(ROUTES.HOME);
  }, [router]);

  // Auth state listener
  useEffect(() => {
    let isMounted = true;
    let hasCheckedInitialAuth = false;

    const unsubscribe = authInstance.onAuthStateChanged(
      async user => {
        if (!isMounted || isLoginInProgress || navigationHandled) return;

        try {
          if (user && !hasCheckedInitialAuth) {
            hasCheckedInitialAuth = true;
            const tokenStored = await storeUserTokens(user, null);
            if (tokenStored) {
              setIsAuthenticated(true);
              console.log('Auth state listener: Redirecting existing user to /findTrips');
              router.push(ROUTES.FIND_TRIPS);
            } else {
              throw new Error('Failed to store user tokens');
            }
          } else if (!user) {
            setIsAuthenticated(false);
            await clearStoredTokens();
          }

          if (!hasCheckedInitialAuth) {
            hasCheckedInitialAuth = true;
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setError('เกิดข้อผิดพลาดในการยืนยันตัวตน');
        }
      },
      error => {
        if (!isMounted || isLoginInProgress) return;
        console.error('Auth state listener error:', error);
        setError('เกิดข้อผิดพลาดในระบบยืนยันตัวตน');
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [
    authInstance,
    router,
    storeUserTokens,
    clearStoredTokens,
    isLoginInProgress,
    navigationHandled,
  ]);

  // Progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(progressAnimation, {
        toValue: 33.33,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, 300);

    return () => clearTimeout(timer);
  }, [progressAnimation]);

  // Loading state for fonts
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
      <Stack.Screen
        options={{ headerShown: false, tabBarStyle: { display: 'none' } }}
      />

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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo} />
        </View>

        {/* App Name & Subtitle */}
        <Text style={styles.appName}>TripMate</Text>
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
        <View style={styles.termsContainer}>
          <Text style={styles.descriptionText}>
            เข้าสู่ระบบด้วย Google เพื่อความสะดวกและปลอดภัย
          </Text>
          <View style={styles.termsTextContainer}>
            <Text style={styles.termsBaseText}>การเข้าสู่ระบบเป็นการยอมรับ </Text>
            <TouchableOpacity onPress={handleTerms}>
              <Text style={styles.linkText}>
                นโยบายความเป็นส่วนตัวและข้อกำหนดการใช้งาน
              </Text>
            </TouchableOpacity>
            <Text style={styles.termsBaseText}> ของเรา</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'InterTight-Regular',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'InterTight-SemiBold',
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
    borderRadius: 48,
    backgroundColor: '#3B82F6',
  },
  appName: {
    fontSize: 24,
    fontFamily: 'InterTight-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'InterTight-Regular',
    marginBottom: 60,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'InterTight-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'InterTight-SemiBold',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: 350,
    height: 58,
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
  disabledButton: {
    opacity: 0.6,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
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
    fontFamily: 'InterTight-SemiBold',
    lineHeight: 16,
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'InterTight-Regular',
    marginBottom: 20,
  },
  termsTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsBaseText: {
    fontFamily: 'InterTight-Regular',
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  linkText: {
    color: '#3B82F6',
    fontFamily: 'InterTight-Regular',
    fontSize: 12,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});

export default Login;
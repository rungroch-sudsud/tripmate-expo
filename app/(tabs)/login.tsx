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
          <Text style={styles.googleIcon}>G</Text>
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
      {'\n\n\n\n'}
      <Text style={styles.termsBaseText}>การเข้าสู่ระบบเป็นการยอมรับ </Text>
      <TouchableOpacity>
        <Text style={styles.linkText}>นโยบายความเป็นส่วนตัวและข้อกำหนดการใช้งาน</Text>
      </TouchableOpacity>
      <Text style={styles.termsBaseText}> ของเรา</Text>
    </Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false, 
          tabBarStyle: { display: 'none' } 
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

        <Text style={styles.appName}>TripMate</Text>
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
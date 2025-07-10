import React, { useRef, useEffect, useState } from 'react';
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
import styles from '../../src/css/login_styles';

import { NAVIGATION_ROUTES } from '../../src/services/userServices';
import {
  storeUserTokens,
  clearStoredTokens,
  createUserProfile,
  getUserProfile
} from '../../src/services/authService';
import ProgressBar from  '../../src/shared/components/ProgressBar'

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const auth = getAuth();

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);

      const stored = await storeUserTokens(user, credential?.accessToken);
      if (!stored) throw new Error('Token storage failed');

      const { success, route } = await createUserProfile(user);
      if (success) {
        setTimeout(() => router.push(route), 100);
      } else {
        throw new Error('Profile creation failed');
      }

    } catch (error) {
      console.error('Google sign-in error:', error);
      await clearStoredTokens();
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-authenticated user handler
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && !isLoading) {
        try {
          const stored = await storeUserTokens(user, null);
          if (!stored) return;

          const profile = await getUserProfile(user.uid);
          console.log(profile);
          if(profile){
               if (profile?.age !== -999) {
            router.push(NAVIGATION_ROUTES.FIND_TRIPS);
          }
          }
       
        } catch {
          await clearStoredTokens();
        }
      }
    });

    return unsubscribe;
  }, []);

  // Progress animation on load
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: 33.33,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, []);



  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' } }} />

      <View style={styles.header}>
        <Text style={styles.headerText}>เข้าสู่ระบบ</Text>
      </View>

      <ProgressBar animation={progressAnimation} styles={styles}/>

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
      </View>
    </SafeAreaView>
  );
};

export default Login;
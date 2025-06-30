import { useState, useCallback, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {signInWithCredential} from 'firebase/auth'
// Configure Google Sign-in for different platforms
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
  });
}

const AUTH_ERRORS = {
  POPUP_CLOSED: 'auth/popup-closed-by-user',
  POPUP_BLOCKED: 'auth/popup-blocked',
  NETWORK_ERROR: 'auth/network-request-failed',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
};

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const authInstance = getAuth();

  const signInWeb = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    const result = await Promise.race([
      signInWithPopup(authInstance, provider),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign-in timeout')), 30000)
      )
    ]);

    return {
      user: result.user,
      accessToken: GoogleAuthProvider.credentialFromResult(result)?.accessToken,
    };
  }, [authInstance]);

  const signInNative = useCallback(async () => {
    await GoogleSignin.hasPlayServices();
    const { idToken, user } = await GoogleSignin.signIn();
    
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(authInstance, credential);
    
    return {
      user: result.user,
      accessToken: idToken,
    };
  }, [authInstance]);

  const signIn = useCallback(async () => {
    if (isLoading) return null;

    setIsLoading(true);
    setError(null);

    try {
      const authResult = Platform.OS === 'web' 
        ? await signInWeb() 
        : await signInNative();
      
      return authResult;
    } catch (error) {
      console.error('Google Sign In Error:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      
      if (error?.code) {
        switch (error.code) {
          case AUTH_ERRORS.POPUP_CLOSED:
          case AUTH_ERRORS.SIGN_IN_CANCELLED:
            errorMessage = 'การเข้าสู่ระบบถูกยกเลิก';
            break;
          case AUTH_ERRORS.POPUP_BLOCKED:
            errorMessage = 'กรุณาอนุญาต popup ในเบราว์เซอร์';
            break;
          case AUTH_ERRORS.NETWORK_ERROR:
            errorMessage = 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้';
            break;
          case AUTH_ERRORS.TOO_MANY_REQUESTS:
            errorMessage = 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่';
            break;
        }
      } else if (error.message === 'Sign-in timeout') {
        errorMessage = 'การเข้าสู่ระบบใช้เวลานานเกินไป';
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, signInWeb, signInNative]);

  return {
    signIn,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
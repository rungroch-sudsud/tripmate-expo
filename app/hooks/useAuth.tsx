import { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import UserService from '../services/userServices';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const authInstance = getAuth();

  useEffect(() => {
    const unsubscribe = authInstance.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userProfile = await UserService.getUserProfile(firebaseUser.uid);
          
          if (userProfile) {
            setUser(firebaseUser);
            setIsAuthenticated(true);
            await UserService.storeUserTokens(firebaseUser, null);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            await UserService.clearStoredTokens();
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          await UserService.clearStoredTokens();
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [authInstance]);

  const signOut = useCallback(async () => {
    try {
      await authInstance.signOut();
      await UserService.clearStoredTokens();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [authInstance]);

  return {
    isAuthenticated,
    isLoading,
    user,
    signOut,
  };
};
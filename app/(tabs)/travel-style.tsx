import React, { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import styles from '../../css/travelstyle_styles';
import { Category, ApiResponse } from '../../shared/schemas/api.schema';
import { 
  getUserProfile, 
  fetchUserProfile, 
  updateUserProfile, 
  fetchTravelStyles 
} from '../../features/user/services/userServices';
import ProgressBar from  '../../components/ProgressBar' 
const TravelStyleScreen: React.FC = () => {
  const router = useRouter();  
  const [email, setEmail] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoaded, setProfileLoaded] = useState<boolean>(false);
  const progressAnimation = useRef(new Animated.Value(33.33)).current;

  // Memoized callback for fetchEmail
  const fetchEmail = useCallback(async () => {
    try {
      const storedID = await AsyncStorage.getItem('userId');
      console.log('User ID:', storedID);
      setEmail(storedID);
    } catch (error) {
      console.error('Error fetching email:', error);
    }
  }, []);

  // Memoized callback for fetchTravelStyles using service
  const loadTravelStyles = useCallback(async (): Promise<Category[]> => {
    try {
      setLoading(true);
      const categoriesData = await fetchTravelStyles();
      setCategories(categoriesData);
      return categoriesData;
    } catch (error) {
      console.error('Failed to fetch travel styles:', error);
      setCategories([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized callback for fetching user profile using service
  const loadUserProfile = useCallback(async (userId: string, categoriesData: Category[]): Promise<void> => {
    try {
      const userProfile = await getUserProfile(userId);
      
      if (!userProfile) {
        console.log('No user profile found');
        setSelectedItems([]);
        setProfileLoaded(true);
        return;
      }

      const userTravelStyles = userProfile.travelStyles || [];
      
      console.log('API returned travel styles:', userTravelStyles);
      console.log('Available categories:', categoriesData);
      
      // If userTravelStyles contains titles, map them to IDs
      if (userProfile.age !== -999) {
        const travelStyleIds = userTravelStyles.map((styleTitle: string) => {
          const matchingCategory = categoriesData.find(cat => cat.title === styleTitle);
          return matchingCategory ? matchingCategory.id : null;
        }).filter((id: string | null) => id !== null);
        
        console.log('Mapped travel style IDs:', travelStyleIds);
        setSelectedItems(travelStyleIds);
      } else {
        // Assume userTravelStyles are already IDs
        console.log('Setting travel styles as IDs:', userTravelStyles);
        setSelectedItems(userTravelStyles);
      }
      
      setProfileLoaded(true);
      
    } catch (error) {
      console.error("User Profile Fetching Error:", error);
      setSelectedItems([]);
      setProfileLoaded(true);
    }
  }, []);

  // Effect for fetching email
  useEffect(() => {
    fetchEmail();
  }, [fetchEmail]);

  // Effect for animation and initial data loading
  useEffect(() => {
    const animateProgress = () => {
      Animated.timing(progressAnimation, {
        toValue: 66.66,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    const timer = setTimeout(animateProgress, 300);
    
    // Initial load of categories and user profile
    const loadInitialData = async () => {
      try {
        const categoriesData = await loadTravelStyles();
        const userId = await AsyncStorage.getItem('userId');
        
        if (userId && categoriesData.length > 0) {
          await loadUserProfile(userId, categoriesData);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();

    return () => clearTimeout(timer);
  }, []);

  // Only reload profile data when screen is focused AND profile hasn't been loaded yet
  useFocusEffect(
    useCallback(() => {
      const reloadProfileIfNeeded = async () => {
        if (!profileLoaded && categories.length > 0) {
          const userId = await AsyncStorage.getItem('userId');
          if (userId) {
            await loadUserProfile(userId, categories);
          }
        }
      };

      reloadProfileIfNeeded();
    }, [profileLoaded, categories, loadUserProfile])
  );

  const toggleSelection = useCallback((id: string): void => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);

  const handleContinue = useCallback(async (): Promise<void> => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      const profileData = {
        userId,
        travelStyles: selectedItems,
      };

      const result = await updateUserProfile(profileData);

      if (result.success) {
        await AsyncStorage.setItem('travelStyles', JSON.stringify(result.data.data.travelStyles));
        console.log("Travel style updated:", result.data.data.travelStyles);
        router.push("/account-verification");
      } else {
        if (result.error?.response?.status === 404) {
          router.push("/login");
        } 
      }
    } catch (error) {
      console.error("Failed to update travel styles:", error);
    }
  }, [selectedItems, router]);

  const handleGoBack = useCallback(async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      console.log('User logged out successfully');

      await AsyncStorage.multiRemove(['googleIdToken', 'googleAccessToken', 'userId']);
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/login');
    }
  }, [router]);

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          title: '',
          headerTitle: '',
        }} 
      />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <FontAwesome name="angle-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerText}>สร้างโปรไฟล์</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
       <ProgressBar animation={progressAnimation} styles={styles}/>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>
            เลือกกิจกรรมที่คุณชอบทำเวลาเที่ยว
          </Text>

          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedItems.includes(category.id) && styles.selectedItem
                ]}
                onPress={() => toggleSelection(category.id)}
              >
                <Image
                  source={{ 
                    uri: selectedItems.includes(category.id) 
                      ? category.activeIconImageUrl || category.iconImageUrl
                      : category.iconImageUrl || 'https://via.placeholder.com/30x30/000000/FFFFFF?text=?'
                  }}
                  style={[
                    styles.categoryIcon,
                    {
                      tintColor: selectedItems.includes(category.id) ? '#29C4AF' : '#000',
                    }
                  ]}
                  resizeMode="contain"
                />
                <Text style={[
                  styles.categoryText,
                  selectedItems.includes(category.id) && styles.selectedText
                ]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              selectedItems.length === 0 && styles.disabledButton
            ]}
            disabled={selectedItems.length === 0}
            onPress={handleContinue}
          >
            <Text style={[
              styles.continueButtonText,
              selectedItems.length === 0 && styles.disabledButtonText
            ]}>
              ยืนยันและดำเนินการต่อ
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={selectedItems.length === 0 ? '#ccc' : '#fff'} 
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Full Screen Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#29C4AF" />
            <Text style={styles.loadingText}>กำลังโหลด...</Text>
          </View>
        </View>
      )}
    </>
  );
};

export default TravelStyleScreen;
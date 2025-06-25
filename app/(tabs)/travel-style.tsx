import React, { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { axiosInstance } from '../lib/axios';
import { useFonts } from 'expo-font';
import { getAuth, signOut } from 'firebase/auth';
import  styles from './css/travelstyle_styles'
interface Category {
  id: string;
  title: string;
  iconImageUrl: string;
  activeIconImageUrl: string;
}

interface ApiResponse {
  data: {
    id: string;
    title: string;
    iconImageUrl: string;
    activeIconImageUrl: string;
  }[];
  message: string;
}

const TravelStyleScreen: React.FC = () => {
  // All hooks at the top level
  const [fontsLoaded] = useFonts({
    'CustomFont': require('../assets/fonts/InterTight-Black.ttf'),
    'InterTight-SemiBold': require('../assets/fonts/InterTight-SemiBold.ttf'),
    'InterTight-Regular': require('../assets/fonts/InterTight-Regular.ttf')
  });
  
  const router = useRouter();
  const route = useRoute();
  const navigation = useNavigation();
  
  const [email, setEmail] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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


  const fetchUserProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users/profile/${userId}`);
      const userProfile = response.data.data;
      const userTravelStyles = userProfile.travelStyles || [];
      
      // Log the data from API first to see what we're getting
      console.log('API returned travel styles:', userTravelStyles);
      
      // If userTravelStyles contains titles, we need to map them to IDs
      // Wait for categories to be loaded first, then map titles to IDs
      if (categories.length > 0) {
      if(userProfile.age!==-999){
        const travelStyleIds = userTravelStyles.map((styleTitle: string) => {
          const matchingCategory = categories.find(cat => cat.title === styleTitle);
          return matchingCategory ? matchingCategory.id : null;
        }).filter((id: string | null) => id !== null); // Remove null values
        
        console.log('Mapped travel style IDs:', travelStyleIds);
        setSelectedItems(travelStyleIds);
      }
      else{
        setSelectedItems(userTravelStyles);
      }
      } else {
        // If categories aren't loaded yet, assume userTravelStyles are already IDs
        console.log('Setting travel styles as IDs:', userTravelStyles);
        setSelectedItems(userTravelStyles);
      }
      
    } catch (error) {
      console.error("User Profile Fetching Error:", error);
      setSelectedItems([]);
    } finally {
      setLoading(false);
    }
  }, [categories]); // Add categories as dependency





  // Memoized callback for fetchTravelStyles
  const fetchTravelStyles = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/travel-styles');
      const result: ApiResponse = response.data;
      
      const mappedCategories: Category[] = result.data.map(item => ({
        id: item.id,
        title: item.title,
        iconImageUrl: item.iconImageUrl,
        activeIconImageUrl: item.activeIconImageUrl || item.iconImageUrl,
      }));
      
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Failed to fetch travel styles:', error);
      Alert.alert(
        'Error',
        'Failed to load travel styles. Please try again.',
        [{ text: 'OK' }]
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for fetching email
  useEffect(() => {
    fetchEmail();
  }, [fetchEmail]);

  // useFocusEffect to clear selected items when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Clear selected items when the screen loses focus
      return () => {
        setSelectedItems([]);
      };
    }, [])
  );

  // Effect for clearing selected items when navigating away
  useEffect(() => {
    return () => {
      setSelectedItems([]);
    };
  }, [router]);

  // Effect for animation and fetching travel styles
  useEffect(() => {
    const animateProgress = () => {
      Animated.timing(progressAnimation, {
        toValue: 66.66,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    const timer = setTimeout(animateProgress, 300);
    fetchTravelStyles();

    return () => clearTimeout(timer);
  }, [fetchTravelStyles]);


  useFocusEffect(
    useCallback(() => {
      const fetchProfileData = async () => {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          // Make sure categories are loaded before fetching profile
          if (categories.length === 0) {
            await fetchTravelStyles();
          }
          await fetchUserProfile(userId);
        } else {
          console.error("User ID is not available");
        }
      };
  
      fetchProfileData();
    }, [fetchUserProfile, categories, fetchTravelStyles])
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
      
      if (!userId) {
        Alert.alert("Error", "User ID not found. Please log in.");
        router.push("/login");
        return;
      }

      const payload = {
        userId,
        travelStyles: selectedItems,
      };

      const response = await axiosInstance.patch(`/users/profile/${userId}`, payload);

      if (response.status === 200) {
        await AsyncStorage.setItem('travelStyles', JSON.stringify(response.data.data.travelStyles));
        console.log("Travel style updated:", response.data.data.travelStyles);
        router.push("/account-verification");
      } else if (response.status === 404) {
        Alert.alert("Error", "User profile not found. Please log in again.");
        router.push("/login");
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to update travel styles:", error);
      Alert.alert("Error", "Failed to update travel styles. Please try again.");
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

  // Don't render anything if fonts aren't loaded yet
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#29C4AF" />
          <Text style={styles.loadingText}>Loading fonts...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '66.66%'],
                  }),
                },
              ]} 
            />
          </View>
        </View>

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
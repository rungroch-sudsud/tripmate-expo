import React, { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerText: {
    fontSize: 19,
    fontWeight: '300',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'InterTight-Regular'
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 2,
  },
  title: {
    fontSize: 16,
    color: '#333',
    fontWeight: '800',
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: 'InterTight-Regular'
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 38,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedItem: {
    backgroundColor: 'rgba(41, 196, 175, 0.1)',
    borderColor: '#29C4AF',
  },
  categoryIcon: {
    width: 14,
    height: 12,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '700',
    fontFamily: 'InterTight-Regular'
  },
  selectedText: {
    color: '#29C4AF',
    fontFamily: 'InterTight-Regular'
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 34,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#29C4AF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  disabledButtonText: {
    color: '#ccc',
  },
  buttonIcon: {
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'InterTight-Regular',
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
    backgroundColor: '#29C4AF',
    borderRadius: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default TravelStyleScreen;
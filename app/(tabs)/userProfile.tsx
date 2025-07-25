import { getUserProfile } from '../../features/user/services/userServices'
import { View, Image, SafeAreaView, Text, StyleSheet, TouchableOpacity, Animated ,StyleProp,ViewStyle, Dimensions} from 'react-native'
import BottomNavigation from '../../components/customNavigation'
import { Stack, useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import React, { useState, useRef, useEffect } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import {styles} from '../../css/userProfile_css'

const { height: screenHeight } = Dimensions.get('window');

type Dimension = number | `${number}%` | 'auto';

interface SkeletonBoxProps {
  width: Dimension;
  height: Dimension;
  style?: StyleProp<ViewStyle>;
}
interface Review {
  rating: number;
}

interface ProfileData {
  reviews: Review[];
  profileImageUrl:string;
  occupation:string;
  fullname:string
}

// Modal Component
const ThreeDotsModal = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const modalHeight = screenHeight * 0.5; // Half screen height
  const translateY = useRef(new Animated.Value(modalHeight)).current;
  const lastGestureY = useRef(modalHeight);

  useEffect(() => {
    if (isVisible) {
      // Slide up to half screen
      lastGestureY.current = 0;
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      // Slide down
      lastGestureY.current = modalHeight;
      Animated.spring(translateY, {
        toValue: modalHeight,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [isVisible, modalHeight]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newTranslateY = lastGestureY.current + event.translationY;
      
      // Only allow positive (downward) translation
      if (newTranslateY >= 0) {
        translateY.setValue(newTranslateY);
      }
    })
    .onEnd((event) => {
      const { translationY, velocityY } = event;
      const totalTranslation = lastGestureY.current + translationY;

      const shouldClose = totalTranslation > 50 || velocityY > 300;

      if (shouldClose) {
        // Immediately disable interactions by calling onClose
        onClose();
        lastGestureY.current = modalHeight;
        Animated.spring(translateY, {
          toValue: modalHeight,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } else {
        // Snap back to open position
        lastGestureY.current = 0;
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    });

  if (!isVisible) return null;

  return (
    <View style={modalStyles.overlay}>
      <TouchableOpacity 
        style={modalStyles.backdrop} 
        activeOpacity={1}
        onPress={onClose}
      />
      <GestureDetector gesture={panGesture}>
        <Animated.View 
          style={[
            modalStyles.modalContainer,
            {
              transform: [{ translateY: translateY }]
            }
          ]}
        >
          {/* Drag Handle */}
          <View style={modalStyles.dragHandle} />
          
          {/* Modal Content */}
          <View style={modalStyles.content}>
            <TouchableOpacity style={modalStyles.menuItem}>
              <Ionicons name="settings-outline" size={24} color="#333" />
              <Text style={modalStyles.menuText}>การตั้งค่า</Text>
            </TouchableOpacity>

            <TouchableOpacity style={modalStyles.menuItem}>
             <Ionicons name="receipt-outline" size={24} color="#333" />

              <Text style={modalStyles.menuText}>ประวัติการจอง</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={modalStyles.menuItem}>
              <Ionicons name="log-out-outline" size={24} color="#FF0000" />
              <Text style={[modalStyles.menuText,{color:'#FF0000'}]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.5, // Fixed height to half screen
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area padding
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
});

const SkeletonBox: React.FC<SkeletonBoxProps> = ({ width, height, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e5e7eb', '#f3f4f6'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor,
          borderRadius: 8,
        },
        style,
      ]}
    />
  );
};

const SkeletonLoader = ( {userId}:{userId :string} ) => {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Background Skeleton */}
      <View style={styles.backgroundImageContainer}>
        <SkeletonBox 
          width="100%" 
          height="100%" 
          style={{ borderRadius: 0 }}
        />
        
        {/* Action Buttons Skeleton */}
      
          <SkeletonBox width={20} height={20} style={{ borderRadius: 10 }} />
    
        
      
          <SkeletonBox width={24} height={24} style={{ borderRadius: 12 }} />
        
      </View>

      {/* Draggable Sheet Skeleton */}
      <View style={styles.draggableSheet}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />
        
        {/* User Info Content Skeleton */}
        <View style={styles.userInfoContent}>
          {/* Avatar Skeleton */}
          <View style={styles.avatarContainer}>
            <SkeletonBox 
              width={80} 
              height={80} 
              style={{ borderRadius: 40 }}
            />
          </View>
          
          {/* Name Skeleton */}
          <SkeletonBox 
            width={180} 
            height={28} 
            style={{ marginBottom: 12, borderRadius: 14 }}
          />
          
          {/* Occupation and Rating Row Skeleton */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <SkeletonBox 
              width={100} 
              height={20} 
              style={{ marginRight: 8, borderRadius: 10 }}
            />
            <SkeletonBox 
              width={8} 
              height={20} 
              style={{ marginRight: 8, borderRadius: 4 }}
            />
            <SkeletonBox 
              width={18} 
              height={18} 
              style={{ marginRight: 4, borderRadius: 9 }}
            />
            <SkeletonBox 
              width={30} 
              height={20} 
              style={{ borderRadius: 10 }}
            />
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <BottomNavigation currentScreen="profile" userId={userId} />
      </View>
    </SafeAreaView>
  );
};

const UserProfile = () => {
  const params = useLocalSearchParams();
  const userId = params.userId;
  
  // State based on your API response structure
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Animation values for draggable bottom sheet
  const translateY = useRef(new Animated.Value(0)).current;
  const lastGestureY = useRef(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        if (!userId) return;
        try {
          setLoading(true);
          const profileResult = await getUserProfile(userId as string);
          setProfileData(profileResult || null);
          setError(null);
        } catch (err) {
          setError('Failed to fetch profile');
          console.error('Error in fetchProfile:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, [userId])
  );

  const averageRating = profileData?.reviews?.length
    ? profileData.reviews.reduce((sum, r) => sum + r.rating, 0) / profileData.reviews.length
    : 0;

  // New Gesture API implementation
 const panGesture = Gesture.Pan()
  .onUpdate((event) => {
    const newTranslateY = lastGestureY.current + event.translationY;

    // Only allow positive (downward) translation
    if (newTranslateY >= 0) {
      translateY.setValue(newTranslateY);
    }
  })
  .onEnd((event) => {
    const { translationY, velocityY } = event;
    const totalTranslation = lastGestureY.current + translationY;

    const shouldSnapDown = totalTranslation > 100 || velocityY > 500;
    let toValue = 0; // default snap-back

    if (shouldSnapDown) {
      toValue = 200; // Snap down if dragged far enough
    }

    lastGestureY.current = toValue;

    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  });

  // Show skeleton loading
  if (loading) {
    return <SkeletonLoader userId={Array.isArray(userId)?userId[0]:userId} />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
        <View style={styles.bottomNavContainer}>
          <BottomNavigation currentScreen="profile" userId={userId} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text style={styles.noDataText}>No profile data available</Text>
        </View>
        <View style={styles.bottomNavContainer}>
          <BottomNavigation currentScreen="profile" userId={userId} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Base Layer - Full Width Profile Image */}
      <View style={styles.backgroundImageContainer}>
        {profileData.profileImageUrl ? (
          <Image 
            source={{ uri: profileData.profileImageUrl,
               cache: 'default',

             }} 
            style={styles.backgroundImage}
            resizeMode='cover'
            resizeMethod='auto'
          />
        ) : (
          <View style={[styles.backgroundImage, styles.placeholderBackground]} />
        )}

        {/* Action Buttons on Image */}
        <TouchableOpacity 
          style={styles.editProfile} 
          onPress={() => router.push(`/profile?userId=${userId}`)}
          disabled={isModalVisible}
        >
          <Image 
            source={require('../assets/images/edit-profile.png')} 
            style={{ height: 20, width: 20 }}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.threedots}
          onPress={() => setIsModalVisible(true)}
        >
          <Image 
            source={require('../assets/images/3-dots.png')} 
            style={{ height: 24, width: 24 }}
          />
        </TouchableOpacity>
      </View>

      {/* Draggable Layer - User Info Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View 
          style={[
            styles.draggableSheet,
            {
              transform: [{ translateY: translateY }]
            }
          ]}
          pointerEvents={isModalVisible ? 'none' : 'auto'}
        >
          {/* Home Tab / Drag Handle */}
          <View style={styles.dragHandle} />
          
          {/* User Info Content */}
          <View style={styles.userInfoContent}>
            {/* Profile Avatar */}
            <View style={styles.avatarContainer}>
              {profileData.profileImageUrl ? (
                <Image 
                  source={{ uri: profileData.profileImageUrl }} 
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.avatar, styles.placeholderAvatar]} />
              )}
            </View>
 {/* User Name */}
            <Text style={styles.userName}>{profileData.fullname}</Text>
           <View style={{flexDirection:'row',alignContent:'space-between',alignItems:'center',justifyContent:'center'}}> 
           

            {/* Occupation */}
            {profileData.occupation && (
              <Text style={styles.occupation}>{profileData.occupation}</Text>
            )}
            <Text style={{marginBottom:1,color:'#9CA3AF'}}> | </Text>

            {/* Rating */}
         
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>
                {averageRating.toFixed(1)}
              </Text>
          
            </View>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Bottom Navigation - Ensure it's always visible */}
      <View 
        style={styles.bottomNavContainer}
        pointerEvents={isModalVisible ? 'none' : 'auto'}
      >
        <BottomNavigation currentScreen="profile" userId={userId} />
      </View>

      {/* Three Dots Modal */}
      <ThreeDotsModal 
        isVisible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
      />
    </SafeAreaView>
  );
};


export default UserProfile;
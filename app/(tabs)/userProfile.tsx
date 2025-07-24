import { getUserProfile } from '../../features/user/services/userServices'
import { View, Image, SafeAreaView, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import BottomNavigation from '../../components/customNavigation'
import { Stack, useRouter, useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import React, { useEffect, useState, useRef } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const UserProfile = () => {
  const params = useLocalSearchParams();
  const userId = params.userId;
  
  // State based on your API response structure
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation values for draggable bottom sheet
  const translateY = useRef(new Animated.Value(0)).current;
  const lastGestureY = useRef(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        if (!userId) return;
        try {
          setLoading(true);
          const profileResult = await getUserProfile(userId);
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


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        <View style={styles.bottomNavContainer}>
          <BottomNavigation currentScreen="profile" userId={userId} />
        </View>
      </SafeAreaView>
    );
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
            source={{ uri: profileData.profileImageUrl }} 
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.backgroundImage, styles.placeholderBackground]} />
        )}

        {/* Action Buttons on Image */}
        <TouchableOpacity 
          style={styles.editProfile} 
          onPress={() => router.push(`/profile?userId=${userId}`)}
        >
          <Image 
            source={require('../assets/images/edit-profile.png')} 
            style={{ height: 20, width: 20 }}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.threedots}>
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
      <View style={styles.bottomNavContainer}>
        <BottomNavigation currentScreen="profile" userId={userId} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
  },
  noDataText: {
    color: '#fff',
    fontSize: 16,
  },
  
  // Background Layer - Full Profile Image
  backgroundImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBackground: {
    backgroundColor: '#e5e7eb',
  },
  editProfile: {
    position: 'absolute',
    top: 60,
    left: 16,
    padding: 8,
    backgroundColor: 'rgba(156, 163, 175, 0.8)',
    borderRadius: 50,
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threedots: {
    position: 'absolute',
    top: 60,
    right: 16,
    padding: 6,
    backgroundColor: 'rgba(156, 163, 175, 0.8)',
    borderRadius: 50,
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Draggable Bottom Sheet
  draggableSheet: {
    position: 'absolute',
    bottom: 90, // Increased space for bottom navigation
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    minHeight: 300,
    zIndex: 5, // Lower than bottom nav but higher than background
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  
  // Drag Handle (Home Tab)
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },

  // User Info Content
  userInfoContent: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderAvatar: {
    backgroundColor: '#e5e7eb',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'LineSeedSansTH_A_Bd',
  },
  occupation: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'LineSeedSansTH',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'LineSeedSansTH_A_Bd',
  },

  // Bottom Navigation Container
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 15, // Highest z-index to ensure it's always visible
    elevation: 10,
    backgroundColor: 'transparent',
  },
});

export default UserProfile;
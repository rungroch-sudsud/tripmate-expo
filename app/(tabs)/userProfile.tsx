import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserProfile } from '../../features/user/services/userServices';
import { router,Stack } from 'expo-router';

const { width, height } = Dimensions.get('window');

const UserProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await fetchUserProfile();
      
      if (profile) {
        setUserProfile(profile);
      } else {
        setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      console.error('Profile loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMedia = (url, platform) => {
    if (url) {
      // Handle social media link opening
      console.log(`Opening ${platform}:`, url);
    } else {
      Alert.alert('แจ้งเตือน', `ไม่พบลิงค์ ${platform}`);
    }
  };

  const renderDestinationTags = () => {
    if (!userProfile?.destinations || userProfile.destinations.length === 0) {
      return null;
    }

    return (
      <View style={styles.tagsContainer}>
        {userProfile.destinations.map((destination, index) => (
          <View key={index} style={styles.destinationTag}>
            <Text style={styles.destinationTagText}>{destination}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPastTrips = () => {
    if (!userProfile?.pastTrips || userProfile.pastTrips.length === 0) {
      return null;
    }

    return (
      <View style={styles.pastTripsContainer}>
        {userProfile.pastTrips.slice(0, 3).map((trip, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.tripImageContainer}
            onPress={() => console.log('Open trip:', trip.fileUrl)}
          >
            <Image
              source={{ uri: 'https://via.placeholder.com/100x80/4A90E2/FFFFFF?text=Trip' }}
              style={styles.tripImage}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderProfileContent = () => {
    if (!userProfile) return null;

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
         <Stack.Screen options={{ headerShown: false }} />
        {/* Header with Profile Image */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent']}
            style={styles.headerGradient}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push('/findTrips')}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={[styles.socialButton, styles.facebookButton]}
                onPress={() => handleSocialMedia(userProfile.facebookUrl, 'Facebook')}
              >
                <Ionicons name="logo-facebook" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.socialButton, styles.instagramButton]}
                onPress={() => handleSocialMedia(null, 'Instagram')}
              >
                <Ionicons name="logo-instagram" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
          
          <Image
            source={{ 
              uri: userProfile.profileImageUrl || 'https://via.placeholder.com/300x400/CCCCCC/FFFFFF?text=Profile'
            }}
            style={styles.profileImage}
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>{userProfile.nickname || 'ไม่ระบุชื่อ'}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>4.8</Text>
            </View>
            <Text style={styles.description}>
              🌍 {userProfile.occupation || 'ไม่ระบุอาชีพ'} • {userProfile.age || 'ไม่ระบุอายุ'} ปี • {userProfile.gender || 'ไม่ระบุเพศ'}
            </Text>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>ความสนใจ</Text>
          
          <View style={styles.interestSection}>
            <View style={styles.interestItem}>
              <Ionicons name="location" size={16} color="#FF6B6B" />
              <Text style={styles.interestText}>สายผจญภัย</Text>
            </View>
            <View style={styles.interestItem}>
              <Ionicons name="camera" size={16} color="#4ECDC4" />
              <Text style={styles.interestText}>แนวเพลยมาเนนต์ / ซอฟต์แรม</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>สไตล์การเดินทาง</Text>
          
          {renderDestinationTags()}

          <Text style={styles.sectionTitle}>รูปภาพประกอบจากเที่ยว</Text>
          
          {renderPastTrips()}

          <TouchableOpacity style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>รีวิวผู้ใช้นี้</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูลโปรไฟล์...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>ลองใหม่</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {renderProfileContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'System',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    fontFamily: 'System',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6C5CE7',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  headerContainer: {
    marginTop:60,
    height: 350,
    width:350,
    alignSelf:'center',
    borderRadius:20
  },
  headerGradient: {
    position: 'absolute',

    height: 100,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: 20,
    borderRadius:20
  },
  backButton: {
    padding: 118,
  },
  socialButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  instagramButton: {
    backgroundColor: '#E4405F',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius:20
  },
  profileInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  nickname: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'System',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    color: 'white',
    marginLeft: 4,
    fontFamily: 'System',
  },
  description: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    fontFamily: 'System',
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: 'red',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop:50
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 20,
    fontFamily: 'System',
  },
  interestSection: {
    marginBottom: 16,
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'System',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  destinationTag: {
    backgroundColor: '#F1F3F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  destinationTagText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'System',
  },
  pastTripsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tripImageContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tripImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  reviewButton: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default UserProfileScreen;
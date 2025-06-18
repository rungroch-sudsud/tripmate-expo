import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { axiosInstance } from '../lib/axios';

interface UserProfile {
  age: number;
  destinations: string[];
  email: string;
  facebookUrl: string;
  fullname: string;
  gender: string;
  idCardImageUrl: string;
  lineId: string;
  nickname: string;
  phoneNumber: string;
  portraitImageUrl: string;
  profileImageUrl: string;
  reviews: any[];
  travelStyles: string[];
  userId: string;
}

interface ReviewRequest {
  rating: number;
  tripId: string;
  comment: string;
}

const ReviewScreen: React.FC = () => {
  const router = useRouter();
  const { id, tripId } = useLocalSearchParams();
  
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const targetUserId = Array.isArray(id) ? id[0] : id;
  const currentTripId = Array.isArray(tripId) ? tripId[0] : tripId || '1';




  useEffect(() => {
    fetchUserProfile();
  }, [targetUserId]);

  const fetchUserProfile = async () => {
    if (!targetUserId) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users/profile/${targetUserId}`);
      console.log(response.data);
      setUserProfile(response.data.data);

    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      return;
    }

    if (!targetUserId) {
   
      return;
    }

    try {
      setSubmitting(true);
      
      const reviewData: ReviewRequest = {
        rating,
        tripId: currentTripId,
        comment: comment.trim()
      };

      const response=await axiosInstance.post(`/users/review/${targetUserId}`, reviewData);
      console.log(response.data);
      
      
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starButton}
          disabled={submitting}
        >
          <Ionicons
            name={i < rating ? 'star' : 'star-outline'}
            size={32}
            color={i < rating ? '#FFD700' : '#E0E0E0'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getProfileImage = () => {
    if (userProfile?.profileImageUrl && userProfile.profileImageUrl !== 'N/A') {
      return { uri: userProfile.profileImageUrl };
    }
    return {
      uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b5ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80'
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>รีวิวผู้ใช้</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>รีวิวผู้ใช้</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>ไม่พบข้อมูลผู้ใช้</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รีวิวผู้ใช้</Text>
        <View style={styles.placeholder} />
      </View>

      {/* User Profile */}
      <View style={styles.profileSection}>
        <Image
          source={getProfileImage()}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {userProfile.fullname}
          </Text>
          <Text style={styles.userSubtitle}>
            {userProfile.gender} • อายุ {userProfile.age} ปี
          </Text>
          {userProfile.destinations && userProfile.destinations.length > 0 && (
            <Text style={styles.userDestinations}>
              {userProfile.destinations.join(', ')}
            </Text>
          )}
        </View>
      </View>

      {/* Rating Section */}
      <View style={styles.ratingSection}>
        <Text style={styles.ratingTitle}>ให้คะแนนประสบการณ์</Text>
        <View style={styles.starsContainer}>
          {renderStars()}
        </View>
      </View>

      {/* Comment Section */}
      <View style={styles.commentSection}>
        <Text style={styles.commentLabel}>ความคิดเห็น (ไม่บังคับ)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="แบ่งปันประสบการณ์การเดินทางร่วมกัน..."
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
          editable={!submitting}
        />
        <Text style={styles.commentHint}>
          รีวิวจะช่วยให้คนอื่นทราบถึงประสบการณ์ที่เป็นประโยชน์
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[
          styles.submitButton,
          (rating === 0 || submitting) && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={rating === 0 || submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={[
            styles.submitButtonText,
            (rating === 0 || submitting) && styles.submitButtonTextDisabled
          ]}>
            ส่งรีวิว
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userDestinations: {
    fontSize: 12,
    color: '#999',
  },
  ratingSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 8,
  },
  commentSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flex: 1,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  commentHint: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
});

export default ReviewScreen;
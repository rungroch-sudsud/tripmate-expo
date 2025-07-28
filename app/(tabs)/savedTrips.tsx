import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { axiosInstance } from '../../lib/axios';
import TripCard from '../../components/TripCard'
import BottomNavigation from '../../components/customNavigation'
import {styles} from '../../css/saved_trips'
// Types
interface Trip {
  id: string;
  name: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  maxParticipants: number;
  participants: any[];
  pricePerPerson: number;
  detail?: string;
  groupAtmosphere?: string;
  includedServices: string[];
  travelStyles?: string[];
  tripCoverImageUrl?: string;
  tripOwner: TripOwner;

}

interface TripOwner {
  id: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  age?: number;
  travelStyles?: string[];
  fullname:String
}

interface TravelStyle {
  id: string;
  title: string;
}

// Custom hooks
const useAuth = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);
        if (storedUserId) {
          console.log('Stored userId:', storedUserId);
        }
      } catch (error) {
        console.error('Failed to load userId from AsyncStorage:', error);
      }
    };
    
    loadUserId();
  }, []);

  return { userId, setUserId };
};

const useBookmarks = (userId: string | null) => {
  const [bookmarkedTripIds, setBookmarkedTripIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBookmarkedTrips = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get('/bookmarks');
      
      if (response.status === 200 && response.data.data && Array.isArray(response.data.data)) {
        const tripIds = response.data.data
          .map((bookmark: any) => 
            bookmark.tripId || bookmark.trip_id || bookmark.id || bookmark.trip?.id
          )
          .filter(Boolean);
        
        setBookmarkedTripIds(tripIds);
        console.log(`Loaded bookmarked trips for user ${userId}:`, tripIds);
      } else {
        setBookmarkedTripIds([]);
      }
    } catch (error) {
      console.error('Failed to load bookmarked trips:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error('User not authenticated');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const toggleBookmark = useCallback(async (tripId: string) => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    const isCurrentlyBookmarked = bookmarkedTripIds.includes(tripId);
    
    // Optimistic update
    setBookmarkedTripIds(prev => 
      isCurrentlyBookmarked 
        ? prev.filter(id => id !== tripId)
        : [...prev, tripId]
    );

    try {
      if (isCurrentlyBookmarked) {
        await axiosInstance.delete(`/bookmarks/${tripId}`);
        console.log(`Removed bookmark for trip: ${tripId}`);
      } else {
        await axiosInstance.post(`/bookmarks/${tripId}`);
        console.log(`Added bookmark for trip: ${tripId}`);
      }
    } catch (error) {
      // Revert optimistic update on error
      setBookmarkedTripIds(prev => 
        isCurrentlyBookmarked 
          ? [...prev, tripId]
          : prev.filter(id => id !== tripId)
      );
      
      console.error('Failed to toggle bookmark:', error);
      Alert.alert('Error', 'Failed to update bookmark. Please try again.');
    }
  }, [userId, bookmarkedTripIds]);

  const isBookmarked = useCallback((tripId: string) => 
    bookmarkedTripIds.includes(tripId), [bookmarkedTripIds]);

  return {
    bookmarkedTripIds,
    loadBookmarkedTrips,
    toggleBookmark,
    isBookmarked,
    loading
  };
};

const useTrips = (bookmarkedTripIds: string[]) => {
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [displayedTrips, setDisplayedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = useCallback(async () => {
    if (bookmarkedTripIds.length === 0) {
      setAllTrips([]);
      setFilteredTrips([]);
      setDisplayedTrips([]);
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get('/trips');
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        const savedTrips = response.data.data.filter(trip => 
          bookmarkedTripIds.includes(trip.id)
        );
        
        setAllTrips(savedTrips);
        setFilteredTrips(savedTrips);
        setDisplayedTrips(savedTrips);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      Alert.alert('Error', 'Failed to load saved trips. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookmarkedTripIds]);

  const filterTrips = useCallback((styleId: string, searchQuery: string = '') => {
    let filtered = styleId === 'all' ? allTrips : allTrips.filter(trip => 
      trip.travelStyles?.includes(styleId) || 
      trip.tripOwner?.travelStyles?.includes(styleId)
    );

    if (searchQuery.trim()) {
      filtered = filtered.filter(trip =>
        trip.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTrips(filtered);
    setDisplayedTrips(filtered);
  }, [allTrips]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, [fetchTrips]);

  return {
    allTrips,
    filteredTrips,
    displayedTrips,
    loading,
    refreshing,
    fetchTrips,
    filterTrips,
    onRefresh
  };
};
const Header: React.FC = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>ทริปที่บันทึกไว้</Text>
    <Image 
      source={require('../assets/images/date-icon.png')} 
      style={styles.headerActionIcon} 
    />
  </View>
);




// Main Component
const SavedTripScreen: React.FC = () => {
  const router = useRouter();
  const { userId, setUserId } = useAuth();
  const { 
    bookmarkedTripIds, 
    loadBookmarkedTrips, 
    toggleBookmark, 
    isBookmarked 
  } = useBookmarks(userId);
  const { 
    displayedTrips, 
    loading, 
    refreshing, 
    fetchTrips, 
    onRefresh 
  } = useTrips(bookmarkedTripIds);

  // Load bookmarks when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      loadBookmarkedTrips();
    }
  }, [userId, loadBookmarkedTrips]);

  // Refresh bookmarks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadBookmarkedTrips();
      }
    }, [userId, loadBookmarkedTrips])
  );

  // Fetch trips when bookmarks change
  useEffect(() => {
    if (userId && bookmarkedTripIds.length >= 0) {
      fetchTrips();
    }
  }, [bookmarkedTripIds, userId, fetchTrips]);

  // Event handlers
  const handleTripPress = async (trip: Trip) => {
    Alert.alert('กำลังโหลด...', 'กำลังดึงรายละเอียดทริป');
    
    try {
      const tripDetail = await fetchTripDetail(trip.id);
      if (tripDetail) {
        console.log(tripDetail);
        
      }
    } catch (error) {
       console.error(error);
       
    }
  };

  const handleJoinTrip = async (trip: Trip) => {
    try {
      const response = await axiosInstance.post(`/trips/join/${trip.id}`);
      console.log('Join trip response:', response.data);
      Alert.alert('สำเร็จ', 'ส่งคำขอเข้าร่วมทริปแล้ว');
    } catch (error) {
      console.error('Failed to join trip:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถส่งคำขอเข้าร่วมได้');
    }
  };

  const handleBookmarkToggle = (trip: Trip) => {
    toggleBookmark(trip.id);
  };

  const handleFloatingButtonPress = () => {
    router.push('/createTrip');
  };

  const handleFindTrips = () => {
    router.push('/findTrips');
  };

  const handleSavedTrips = () => {
    router.push('/savedTrips');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
       <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>กำลังโหลดทริป...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Header />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {displayedTrips.length === 0 ? (
          <View>
            <Text>
              ไม่มีทริปที่บันทึกไว้
            </Text>
          </View>
        ) : (
          displayedTrips.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              isBookmarked={isBookmarked(trip.id)}
              onBookmarkToggle={handleBookmarkToggle}
              onTripPress={handleTripPress}
              onJoinTrip={handleJoinTrip}
            />
          ))
        )}
      </ScrollView>

      <BottomNavigation currentScreen="savedTrips" userId={userId} />
    </View>
  );
};
// Helper function to fetch detailed trip information
const fetchTripDetail = async (tripId: string): Promise<Trip | null> => {
    try {
      console.log(`Fetching trip details for ID: ${tripId}`);
      
      const response = await axiosInstance.get(`/trips/${tripId}`);
      
      if (response.status === 200 && response.data?.data) {
        const tripDetail = response.data.data;
        console.log('Trip details fetched successfully:', tripDetail);
        return tripDetail;
      } else {
        console.warn('Invalid response format for trip details');
        return null;
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.error('Trip not found');
          Alert.alert('ข้อผิดพลาด', 'ไม่พบทริปที่ต้องการ');
        } else if (error.response?.status === 401) {
          console.error('User not authenticated');
          Alert.alert('ข้อผิดพลาด', 'กรุณาเข้าสู่ระบบใหม่');
        } else if (error.response?.status >= 500) {
          console.error('Server error');
          Alert.alert('ข้อผิดพลาด', 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่อีกครั้ง');
        } else {
          Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลทริปได้');
        }
      } else {
        Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดที่ไม่คาดคิด');
      }
      
      return null;
    }
  };
  




export default SavedTripScreen;
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { axiosInstance } from '../lib/axios';
import TripCard from './TripCard'
import BottomNavigation from './customNavigation'

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
    <View style={styles.headerLeft}>
      <Image 
        source={require('../assets/images/images/images/image21.png')} 
        style={styles.headerIcon}
      />
      <Text style={styles.headerTitle}>ทริปที่บันทึกไว้</Text>
    </View>
    <View style={styles.headerRight}>
      <Image 
        source={require('../assets/images/images/images/image16.png')} 
        style={styles.headerActionIcon} 
      />
      <Image 
        source={require('../assets/images/images/images/image17.png')} 
        style={[styles.headerActionIcon, { marginLeft: 15 }]} 
      />
    </View>
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
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
  


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    flex:0.9,
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'left',
    paddingVertical: 16,
    marginLeft:10
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    margin: 16,
    marginBottom: 12,
  },
  imageContainer: {
    height: 270,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  participantBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  participantText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
  },
  content: {
    padding: 16,
  },
  tripName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  destinationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  destinationText: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  atmosphere: {
    fontSize: 14,
    color: '#6366f1',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  serviceTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  serviceTagText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  ownerAge: {
    fontSize: 12,
    color: '#6b7280',
  },
  joinButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  participantsInfo: {
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoriesContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 8,
  },
  categoryItemActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryIcon: {
    width: 20,
    height: 20,
    tintColor: '#6c757d',
  },
  categoryIconActive: {
    tintColor: '#ffffff',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#999',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  clearButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Floating Button Styles
  floatingButton: {
    position: 'absolute',
    bottom: 90, // Above bottom navigation
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  floatingButtonIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  tripCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    flexDirection:'row'
  },
  tripCountText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  bottomNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10 },
  navItem: { alignItems: 'center' },
  navIcon: { width: 24, height: 24 },
  savedIcon: { height: 20, width: 15 },
  navText: { fontSize: 12 },
  bookmarkButton: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    height: 40,
    width: 40,
  },
  bookmarkIcon: { height: 20, width: 15 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tripInfo: { flex: 0.9 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerActionIcon: { width: 18, height: 18 },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white' },
  headerLeft: { display: 'flex', flexDirection: 'row', flex: 0.9, alignItems: 'center' },
  headerIcon: { height: 20, width: 15, marginLeft: 5 },
});

export default SavedTripScreen;
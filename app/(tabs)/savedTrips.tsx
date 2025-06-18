import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { axiosInstance } from '../lib/axios';
import {Stack,useRouter} from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {requirements}  from '../requirement'
import axios from 'axios'
import {useFocusEffect} from '@react-navigation/native'


interface TravelStyle {
  id: string;
  title: string;
  iconImageUrl: string;
  activeIconImageUrl: string;
}

interface TravelStylesResponse {
  message: string;
  data: TravelStyle[];
}

interface TripOwner {
  portraitImageUrl: string;
  reviews: any[];
  email: string;
  gender: string;
  destinations: string[];
  travelStyles: string[];
  profileImageUrl: string;
  nickname: string;
  phoneNumber: string;
  userId: string;
  lineId: string;
  idCardImageUrl: string;
  facebookUrl: string;
  fullname: string;
  age: number;
}

interface Participant {
  gender: string;
  profileImageUrl: string;
  reviews: any[];
  phoneNumber: string;
  idCardImageUrl: string;
  age: number;
  facebookUrl: string;
  userId: string;
  lineId: string;
  travelStyles: string[];
  nickname: string;
  portraitImageUrl: string;
  fullname: string;
  email: string;
  destinations: string[];
}

interface Trip {
  id: string;
  status: string;
  name: string;
  includedServices: string[];
  destinations: string[];
  endDate: string;
  maxParticipants: number;
  tripOwnerId: string;
  groupAtmosphere: string;
  startDate: string;
  participants: Participant[];
  travelStyles: string[];
  tripCoverImageUrl: string;
  pricePerPerson: number;
  detail: string;
  tripOwner: TripOwner;
}

interface ApiResponse {
  message: string;
  data: Trip[];
}
interface TripDetailResponse {
  message: string;
  data: Trip;
}

// Helper Functions
const getOwnerInfo = (tripOwner: TripOwner | null | undefined) => {
  if (!tripOwner) {
    return {
      profileImageUrl: 'https://via.placeholder.com/40x40/cccccc/666666?text=👤',
      displayName: 'ไม่ระบุชื่อ',
      age: 'ไม่ระบุอายุ'
    };
  }

  return {
    profileImageUrl: tripOwner.profileImageUrl && tripOwner.profileImageUrl !== 'N/A' 
      ? tripOwner.profileImageUrl 
      : 'https://via.placeholder.com/40x40/cccccc/666666?text=👤',
    displayName: tripOwner.nickname && tripOwner.nickname !== 'N/A' 
      ? tripOwner.nickname 
      : tripOwner.fullname || 'ไม่ระบุชื่อ',
    age: tripOwner.age && tripOwner.age > 0 ? `${tripOwner.age} ปี` : 'ไม่ระบุอายุ'
  };
};



const SavedTripScreen: React.FC = () => {


  useEffect(() => {
  
    fetchTrips();
  }, []);  
  
 
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [displayedTrips, setDisplayedTrips] = useState<Trip[]>([]);
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [selectedTravelStyle, setSelectedTravelStyle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarkedTripIds, setBookmarkedTripIds] = useState<string[]>([]);
  
  const router=useRouter()
  const handlesavedTrips=async()=>{
    router.push('/savedTrips')
  }
  const handlefindTrips=async()=>{
    router.push('/findTrips')
  }
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId !== null) {
          setUserId(storedUserId);
          console.log('Stored userId:', storedUserId);
        } else {
          console.log('No userId found in AsyncStorage');
        }
      } catch (error) {
        console.error('Failed to load userId from AsyncStorage:', error);
      }
    };
    
    loadUserId();
  }, []);

  useEffect(() => {
    fetchTravelStyles();
  }, []);

useEffect(() => {
  if (userId) {
    loadBookmarkedTrips();
  }
}, [userId]);

useFocusEffect(
  useCallback(() => {
   
    if (userId) {
      loadBookmarkedTrips();
    }
  }, [userId])
);

useEffect(() => {
    // Only fetch trips if:
    // - We have a userId
    // - We have loaded bookmarks (either with trips or confirmed empty)
    // - Avoid fetching on initial render when bookmarkedTripIds is still []
    if (userId && (bookmarkedTripIds.length > 0)) {
      console.log('Fetching trips for bookmarks:', bookmarkedTripIds);
      fetchTrips();
    } else if (userId && bookmarkedTripIds.length === 0) {
      // Handle the case where user has no bookmarks
      // Only set empty state if we've actually loaded bookmarks (not initial state)
      // You might want to add a flag to track if bookmarks have been loaded
      console.log('No bookmarked trips to fetch');
      setAllTrips([]);
      setFilteredTrips([]);
      setDisplayedTrips([]);
      setLoading(false);
    }
  }, [bookmarkedTripIds, userId]);
  // Function to load all bookmarked trips
  const loadBookmarkedTrips = async () => {
    if (!userId) {
      console.error('No userId available');
      return;
    }
  
    try {
      setLoading(true);
      
      const response = await axiosInstance.get('/bookmarks');
      console.log('Bookmarks API response:', response.data);
      
      if (response.status === 200 && response.data.data && Array.isArray(response.data.data)) {
        const tripIds = response.data.data.map((bookmark: any) => {
          return bookmark.tripId || bookmark.trip_id || bookmark.id || bookmark.trip?.id;
        }).filter(Boolean);
        
        setBookmarkedTripIds(tripIds);
        console.log(`Loaded bookmarked trips for user ${userId}:`, tripIds);
        
        // Auto-refresh trips after loading bookmarks
        // For SavedTripsScreen: refetch saved trips
        // For FindTripScreen: this will update the bookmark status on existing trips
        if (tripIds.length > 0 || allTrips.length > 0) {
          fetchTrips();
        }
      } else {
        console.log('Unexpected response structure or empty data');
        setBookmarkedTripIds([]);
        // For SavedTripsScreen, clear the trips when no bookmarks
        if (window.location?.pathname?.includes('savedTrips')) {
          setAllTrips([]);
          setFilteredTrips([]);
          setDisplayedTrips([]);
        }
      }
    } catch (error) {
      console.error('Failed to load bookmarked trips:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        if (error.response?.status === 401) {
          console.error('User not authenticated');
          setUserId(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };
  

  // Function to toggle bookmark status
  const handleBookmarkToggle = async (trip: Trip) => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }
  
    const isCurrentlyBookmarked = bookmarkedTripIds.includes(trip.id);
    
    // Optimistic update - update UI immediately
    if (isCurrentlyBookmarked) {
      setBookmarkedTripIds(prev => prev.filter(id => id !== trip.id));
    } else {
      setBookmarkedTripIds(prev => [...prev, trip.id]);
    }
  
    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const response = await axiosInstance.delete(`/bookmarks/${trip.id}`);
        
        if (response.status === 200) {
          console.log(`Removed bookmark for trip: ${trip.id} by user: ${userId}`);
        }
      } else {
        // Add bookmark
        const response = await axiosInstance.post(`/bookmarks/${trip.id}`);
        
        if (response.status === 201) {
          console.log(`Added bookmark for trip: ${trip.id} by user: ${userId}`);
        }
      }
    } catch (error) {
      // Revert the optimistic update on error
      if (isCurrentlyBookmarked) {
        // Was bookmarked, restore it
        setBookmarkedTripIds(prev => [...prev, trip.id]);
      } else {
        // Wasn't bookmarked, remove it again
        setBookmarkedTripIds(prev => prev.filter(id => id !== trip.id));
      }
      
      console.error('Failed to toggle bookmark:', error);
      
      // Handle specific error cases
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        if (error.response?.status === 401) {
          console.error('User not authenticated');
          setUserId(null);
        } else if (error.response?.status === 404) {
          console.error('Bookmark not found');
        }
      }
      
      // TODO: Show error toast/alert to user here
    }
  };

  // Check if a trip is bookmarked
  const isTripBookmarked = (tripId: string): boolean => {
    return bookmarkedTripIds.includes(tripId);
  };



  const fetchTravelStyles = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get<TravelStylesResponse>('/travel-styles');
      setTravelStyles(response.data.data);
    } catch (error) {
      console.error('Error fetching travel styles:', error);
    }
  };
  const fetchTripDetail = async (tripId: string): Promise<Trip | null> => {
    try {
      const response = await axiosInstance.get<TripDetailResponse>(`/trips/${tripId}`);
      
      if (response.data && response.data.data) {
        console.log('Fetched trip detail:', response.data.data);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching trip detail:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดรายละเอียดทริปได้ กรุณาลองใหม่อีกครั้ง');
      return null;
    }
  };
  const fetchTrips = async (): Promise<void> => {
    try {
      // First, make sure we have bookmarked trip IDs loaded
      if (!userId) {
        console.log('No user ID available');
        setAllTrips([]);
        setFilteredTrips([]);
        setDisplayedTrips([]);
        return;
      }
  
      // If bookmarkedTripIds is empty, load them first
      if (bookmarkedTripIds.length === 0) {
        await loadBookmarkedTrips();
      }
  
      // If still no bookmarked trips, show empty state
      if (bookmarkedTripIds.length === 0) {
        console.log('No bookmarked trips found');
        setAllTrips([]);
        setFilteredTrips([]);
        setDisplayedTrips([]);
        return;
      }
  
      const response = await axiosInstance.get<ApiResponse>('/trips');
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('Fetched all trips:', response.data.data.length);
        
        // Filter to only show bookmarked trips
        const savedTrips = response.data.data.filter(trip => 
          bookmarkedTripIds.includes(trip.id)
        );
        
        console.log('Filtered saved trips:', savedTrips.length);
        console.log('Bookmarked trip IDs:', bookmarkedTripIds);
        
        setAllTrips(savedTrips);
        filterTrips(savedTrips, selectedTravelStyle);
      } else {
        setAllTrips([]);
        setFilteredTrips([]);
        setDisplayedTrips([]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      Alert.alert('Error', 'Failed to load saved trips. Please try again.');
      setAllTrips([]);
      setFilteredTrips([]);
      setDisplayedTrips([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
 
  const filterTrips = (trips: Trip[], styleId: string): void => {
    console.log('Filtering trips for style:', styleId);
    console.log('Total trips to filter:', trips.length);
    
    let filtered: Trip[];
    
    if (styleId === 'all') {
      console.log('Showing all trips');
      filtered = trips;
    } else {
      // Find the style title for the given ID
      const selectedStyle = travelStyles.find(style => style.id === styleId);
      const styleTitle = selectedStyle?.title;
      console.log(`Filtering for styleId: ${styleId}, styleTitle: ${styleTitle}`);

      filtered = trips.filter(trip => {
        // Check if trip has travel styles (by ID or title)
        const hasStyleById = trip.travelStyles?.includes(styleId);
        const hasStyleByTitle = styleTitle && trip.travelStyles?.includes(styleTitle);
        
        // Also check tripOwner's travel styles (these seem to use IDs consistently)
        const ownerHasStyle = trip.tripOwner?.travelStyles?.includes(styleId);
        
        console.log(`Trip "${trip.name}":`, {
          tripStyles: trip.travelStyles,
          ownerStyles: trip.tripOwner?.travelStyles,
          hasStyleById,
          hasStyleByTitle,
          ownerHasStyle,
          matches: hasStyleById || hasStyleByTitle || ownerHasStyle
        });
        
        return hasStyleById || hasStyleByTitle || ownerHasStyle;
      });
    }
    
    console.log('Filtered trips count:', filtered.length);
    setFilteredTrips(filtered);
    
    // Apply search filter on the filtered results
    applySearchFilter(filtered, searchQuery);
  };

  const applySearchFilter = (trips: Trip[], query: string): void => {
    if (!query.trim()) {
      setDisplayedTrips(trips);
      return;
    }

    const searchResults = trips.filter(trip =>
      trip.name.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log('Search results count:', searchResults.length);
    setDisplayedTrips(searchResults);
  };
  const handleTripPress = async (trip: Trip): Promise<void> => {
    console.log('Trip pressed:', trip.id);
    
    // Show loading indicator
    Alert.alert('กำลังโหลด...', 'กำลังดึงรายละเอียดทริป', [], { cancelable: false });
    
    try {
      const tripDetail = await fetchTripDetail(trip.id);
      
      if (tripDetail) {
        // Dismiss loading alert
        Alert.alert('', '', [], { cancelable: true });
        
        // Format trip details for display
        const ownerInfo = getOwnerInfo(tripDetail.tripOwner);
        const formattedDate = formatDateRange(tripDetail.startDate, tripDetail.endDate);
        
        const tripDetailsMessage = `
🌟 ${tripDetail.name}

📅 วันที่: ${formattedDate}
📍 จุดหมาย: ${tripDetail.destinations.join(', ')}
👥 ผู้เข้าร่วม: ${tripDetail.participants.length}/${tripDetail.maxParticipants} คน
💰 ราคา: ${tripDetail.pricePerPerson.toLocaleString()} ฿/คน

👤 เจ้าของทริป: ${ownerInfo.displayName} (${ownerInfo.age})

📝 รายละเอียด:
${tripDetail.detail || 'ไม่มีรายละเอียดเพิ่มเติม'}

🎯 บรรยากาศกลุ่ม:
${tripDetail.groupAtmosphere || 'ไม่ระบุ'}

${tripDetail.includedServices.length > 0 ? 
  `🎯 บริการที่รวม:\n${tripDetail.includedServices.map(service => `• ${service}`).join('\n')}` : 
  ''}
        `.trim();

        Alert.alert(
          'รายละเอียดทริป',
          tripDetailsMessage,
          [
            {
              text: 'ปิด',
              style: 'cancel'
            },
            {
              text: 'สนใจเข้าร่วม',
              onPress: () => handleJoinTrip(tripDetail)
            }
          ]
        );
      }
    } catch (error) {
      // Dismiss loading alert and show error
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดรายละเอียดทริปได้');
    }
  };



  const handleJoinTrip = async (trip: Trip) => {
    try {
      console.log('Join trip:', trip.id);
  
      // Retrieve the access token
      const accessToken = await AsyncStorage.getItem('accessToken');
      const idToken = await AsyncStorage.getItem('googleIdToken');
      console.log('Access Token:', accessToken);
      console.log('ID Token:', idToken);
  
         const  response = await axiosInstance.post(
            `${requirements.baseURL}/trips/join/${trip.id}`
          );
          console.log('Response with ID Token:', response.data);
          return;
        } catch (err) {
          console.warn('Failed with ID Token, trying access token:', err);
          // Fall back to accessToken
        }
}
  
    
  
  
  
  
  
  
  



  const handleFloatingButtonPress = (): void => {
    console.log('Floating button pressed');
    Alert.alert('สร้างทริป', 'คุณต้องการสร้างทริปใหม่หรือไม่?');
    // Navigate to create trip screen
    router.push('/createTrip')
  };






 





  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    });
    const end = new Date(endDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    });
    return `${start} - ${end}`;
  };
  



  const renderTripCard = (trip: Trip) => {
    const ownerInfo = getOwnerInfo(trip.tripOwner);




    return (
      <TouchableOpacity
        key={trip.id}
        style={styles.card}
        onPress={() => handleTripPress(trip)}
      >
        {/* Header Image Container */}
        <View style={styles.imageContainer}>
          {trip.tripCoverImageUrl ? (
            <Image
              source={{ uri: trip.tripCoverImageUrl }}
              style={styles.backgroundImage}
            />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          
          {/* Date Badge - Top Left */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>
              {formatDateRange(trip.startDate, trip.endDate)}
            </Text>
          </View>
          
          {/* Max Participant Badge - Top Right */}
          <View style={styles.participantBadge}>
            <Text style={styles.participantIcon}>👥</Text>
            <Text style={styles.participantText}>
              ต้องการ {trip.maxParticipants} คน
            </Text>
          </View>
        </View>

        {/* Content Below Image */}
        <View style={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
  {/* Left Side: Trip Info */}
  <View style={{ flex: 0.9 }}>
    {/* Trip Name */}
    <Text style={styles.tripName}>{trip.name}</Text>

    {/* Destinations */}
    {trip.destinations.length > 0 && (
      <View style={styles.destinationRow}>
        <Image 
          source={require('../assets/images/images/images/image13.png')} 
          style={{ width: 10.5, height: 14, marginRight: 10 }} 
        />
        <View style={styles.destinationContainer}>
          <Text style={styles.destinationText}>
            {trip.destinations.join(', ')}
          </Text>
        </View>
      </View>
    )}
  </View>

  {/* Right Side: Extra Info */}
  <View 
  style={{
    flex: 0.1,
    alignItems: 'flex-end',
    justifyContent: 'center', // This ensures the content (image) is centered.
    backgroundColor: '#E5E7EB',
    borderRadius: 9999,
    height: 40,
    width: 40,
  
  }}
>
<TouchableOpacity        
  style={{ alignSelf: 'center' }}        
  onPress={() => handleBookmarkToggle(trip)}
>       
  <Image         
    source={           
      isTripBookmarked(trip.id)             
        ? require('../assets/images/images/images/image22.png') // Saved/bookmarked icon             
        : require('../assets/images/images/images/image21.png') // Unsaved icon         
    }         
    style={{            
      alignSelf: 'center',            
      height: 20,            
      width: 15,         
    }}       
  />     
</TouchableOpacity>

</View>

</View>


          {/* Description */}
          {trip.detail && (
            <Text style={styles.description} numberOfLines={2}>
              {trip.detail}
            </Text>
          )}

          {/* Group Atmosphere */}
          {trip.groupAtmosphere && (
            <Text style={styles.atmosphere} numberOfLines={2}>
              {trip.groupAtmosphere}
            </Text>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>ราคา:</Text>
            <Text style={styles.priceValue}>
              {trip.pricePerPerson.toLocaleString()} ฿/คน
            </Text>
          </View>

          {/* Services Tags */}
          {trip.includedServices.length > 0 && (
            <View style={styles.tagsContainer}>
              {trip.includedServices.map((service, index) => (
                <View key={index} style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>#{service}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom Row - Owner & Join Button */}
          <View style={styles.bottomRow}>
            <View style={styles.ownerInfo}>
              <Image
                source={{ uri: ownerInfo.profileImageUrl }}
                style={styles.ownerAvatar}
              />
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>
                  {ownerInfo.displayName}
                </Text>
                <Text style={styles.ownerAge}>
                  {ownerInfo.age}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => handleJoinTrip(trip)}
            >
              <Text style={styles.joinButtonText}>สนใจเข้าร่วม</Text>
            </TouchableOpacity>
          </View>

          {/* Participants Count */}
          <View style={styles.participantsInfo}>
            <Text style={styles.participantsText}>
              ผู้เข้าร่วม: {trip.participants.length}/{trip.maxParticipants} คน
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFloatingButton = () => (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={handleFloatingButtonPress}
      activeOpacity={0.8}
    >
      <Text style={styles.floatingButtonIcon}>+</Text>
    </TouchableOpacity>
  );

  // Loading State
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
    
    {/* Header */}
    <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white'}}>
    <View style={{display:'flex',flexDirection:'row',flex:0.9,alignItems:'center'}}>
        <Image source={require('../assets/images/images/images/image21.png')} style={{ height: 20, 
          width: 15,marginLeft:5}}/>
    <Text style={styles.headerTitle}>ทริปที่บันทึกไว้</Text>
    </View>
      <Image 
        source={require('../assets/images/images/images/image16.png')} 
        style={{width:18,height:18,flex:0.05}} 
      />
      <Image 
        source={require('../assets/images/images/images/image17.png')} 
        style={{width:15.75,height:18,flex:0.05,marginHorizontal:15}} 
      />
    </View>

  

  
    {/* Trips List */}
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
    >
      {displayedTrips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {loading ? 'กำลังโหลด...' : 
             searchQuery ? `ไม่พบทริปที่ชื่อ "${searchQuery}"` : 
             'ไม่พบทริปในหมวดหมู่นี้'}
          </Text>
        </View>
      ) : (
        displayedTrips.map(trip => renderTripCard(trip))
      )}
    </ScrollView>

    {/* Floating Action Button */}
    {renderFloatingButton()}

    {/* Bottom Navigation */}
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',paddingVertical:10}}>
      <View style={{ alignItems: 'center'}}>
        <Image 
          source={require('../assets/images/images/images/image18.png')} 
          style={{ width: 24, height: 24}} 
        />
        <Text style={{fontSize: 12 }}>หน้าหลัก</Text>
      </View>
      <TouchableOpacity onPress={handlefindTrips}>
      <View style={{alignItems:'center'}}>
        <Image 
          source={require('../assets/images/images/images/image23.png')} 
          style={{ width: 24, height: 24}} 
        />
        <Text style={{fontSize:12}}>ค้นหา</Text>
      </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlesavedTrips}>
   <View style={{alignItems:'center'}}>
        <Image 
          source={require('../assets/images/images/images/image22.png')} 
          style={{   height: 20, 
            width: 15,}} 
        />
        <Text style={{fontSize:12}}>บันทึก</Text>
      </View>
   </TouchableOpacity>
      <View style={{alignItems:'center'}}>
        <Image 
          source={require('../assets/images/images/images/image20.png')} 
          style={{width: 24, height: 24 }} 
        />
        <Text style={{fontSize:12}}>โปรไฟล์</Text>
      </View>
    </View>
  </View>
  );
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
});

export default SavedTripScreen;
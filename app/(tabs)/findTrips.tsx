import React, { useState, useEffect, useCallback  } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { axiosInstance } from '../lib/axios';
import {Stack,useRouter} from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {requirements}  from '../requirement'
import axios from 'axios'
import {useFonts} from 'expo-font'
import TripCard from './TripCard'

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
    displayName: tripOwner.fullname && tripOwner.fullname !== 'N/A' 
      ? tripOwner.fullname 
      : tripOwner.fullname || 'ไม่ระบุชื่อ',
    age: tripOwner.age && tripOwner.age > 0 ? `${tripOwner.age} ปี` : 'ไม่ระบุอายุ'
  };
};



const FindTripScreen: React.FC = () => {
 
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
  const [fontsLoaded] = useFonts({
    'CustomFont': require('../assets/fonts/InterTight-Black.ttf'),
    'InterTight-SemiBold': require('../assets/fonts/InterTight-SemiBold.ttf'),
    'InterTight-Regular':require('../assets/fonts/InterTight-Regular.ttf')
  });
  

  const router=useRouter()


  useFocusEffect(
    useCallback(() => {

      if (userId) {
        loadBookmarkedTrips();
      }
    }, [userId])
  );

  const handlesavedTrips=async()=>{
    router.push('/savedTrips')
  }

  const handleProfile=async()=>{
     console.log(userId);
     router.push(`/profile?userId=${userId}`)
     
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


  // Load bookmarked trips when userId is available
  useEffect(() => {
    if (userId) {
      loadBookmarkedTrips();
    }
  }, [userId]);

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
        } else {
          throw new Error('Failed to remove bookmark');
        }
      } else {
        // Add bookmark
        const response = await axiosInstance.post(`/bookmarks/${trip.id}`);
        
        if (response.status === 201) {
          console.log(`Added bookmark for trip: ${trip.id} by user: ${userId}`);
        } else {
          throw new Error('Failed to add bookmark');
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
    const accessToken = await AsyncStorage.getItem('googleAccessToken');
   
    console.log("GOOGLE TOKEN",accessToken);
    
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };
    try {
      const response = await axiosInstance.get(`${requirements.baseURL}/trips`,
        config
       
      );
     
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const publishedTrips=response.data.data.filter(trip=>trip.status=="published")
        console.log('Fetched Published trips:', publishedTrips.length);
        setAllTrips(publishedTrips);
        filterTrips(publishedTrips, selectedTravelStyle);
      } else {
        setAllTrips([]);
        setFilteredTrips([]);
        setDisplayedTrips([]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      Alert.alert('Error', 'Failed to load trips. Please try again.');
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
    console.log('Trip pressed:', trip);
  };

  const handleTravelStylePress = (styleId: string): void => {
    console.log('Travel style selected:', styleId);
    setSelectedTravelStyle(styleId);
    filterTrips(allTrips, styleId);
  };

  
  const handleJoinTrip = async (trip: Trip): Promise<void> => {
    try {
      console.log('Join trip:', trip.id);
      
      // Retrieve the access token
      const accessToken = await AsyncStorage.getItem('googleAccessToken');
      const idToken = await AsyncStorage.getItem('googleIdToken');
      console.log('Access Token:', accessToken);
      console.log('ID Token:', idToken);
      
      if (!accessToken && !idToken) {
        console.error('No access token or ID token found');
        return;
      }
      
      const bodyParameters = {}; // Empty payload
      
      // Try using the ID token first if available
      if (idToken) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${idToken}`
            }
          };
          
          const response = await axiosInstance.post(
            `${requirements.baseURL}/trips/join/${trip.id}`,
            bodyParameters,
            config
          );
          
          console.log('Response with ID Token:', response.data);
          router.push(`/stramChat?tripId=${trip.id}`)
          return; // Success, so exit
        } catch (err) {
          console.warn('Failed with ID Token, trying access token:', err);
        
          // Fall back to accessToken
        }
      }
      
      // Fallback to using the access token
      if (accessToken) {
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        };
        
        const response = await axiosInstance.post(
          `${requirements.baseURL}/trips/join/${trip.id}`,
          bodyParameters,
          config
        );
        
        console.log('Response with Access Token:', response.data);
        router.push(`/stramChat?tripId=${trip.id}`)
      }
      
    } catch (error) {
      console.error('Error joining trip:', error);
    }
  };
  
  


  
    
  
  
  
  
  
  
  

  const handleSearchChange = (text: string): void => {
    setSearchQuery(text);
    applySearchFilter(filteredTrips, text);
  };

  const handleFloatingButtonPress = (): void => {
    console.log('Floating button pressed');
    Alert.alert('สร้างทริป', 'คุณต้องการสร้างทริปใหม่หรือไม่?');
    router.push('/createTrip')
    // Navigate to create trip screen
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    fetchTrips();
  };




  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTravelStyles(),
        fetchTrips()
      ]);
    };
    loadData();
  }, []);

  const renderTravelStyleItem = (style: TravelStyle, isSelected: boolean) => (
    <TouchableOpacity
      key={style.id}
      style={[
        styles.categoryItem,
        isSelected && styles.categoryItemActive
      ]}
      onPress={() => handleTravelStylePress(style.id)}
    >
      {(style.iconImageUrl || style.activeIconImageUrl) && (
        <Image
          source={{ 
            uri: isSelected && style.activeIconImageUrl 
              ? style.activeIconImageUrl 
              : style.iconImageUrl 
          }}
          style={[
            styles.categoryIcon,
            isSelected && styles.categoryIconActive
          ]}
        />
      )}
      <Text style={[
        styles.categoryText,
        isSelected && styles.categoryTextActive
      ]}>
        {style.title}
      </Text>
    </TouchableOpacity>
  );



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
  
  //Render All Catagories
  const renderAllCategory = () => (
    <TouchableOpacity
      key="all"
      style={[
        styles.categoryItem,
        selectedTravelStyle === 'all' && styles.categoryItemActive
      ]}
      onPress={() => handleTravelStylePress('all')}
    >
      <Text style={[
        styles.categoryText,
        selectedTravelStyle === 'all' && styles.categoryTextActive
      ]}>
        ทั้งหมด
      </Text>
    </TouchableOpacity>
  );

  const renderTripCountText = () => (
    <View style={styles.tripCountContainer}>
      <Text style={styles.tripCountText}>
      พบ {displayedTrips.length} ทริป
      </Text>
      <View style={{flex:0.1,backgroundColor:'#E5E7EB',justifyContent:'center',alignItems:'center',width:32,height:34,borderRadius:6}}>
            <Image source={require('../assets/images/images/images/image29.png')} style={{width:16,height:16}}/>
      </View>
      <View style={{flex:0.1,backgroundColor:'#FFFFFF',justifyContent:'center',alignItems:'center',width:34,height:34,borderRadius:6,borderWidth:1,borderColor:'#E5E7EB',marginLeft:5}}>
            <Image source={require('../assets/images/images/images/image30.png')} style={{width:16,height:20}}/>
      </View>
    </View>
  );
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Image 
          source={require('../assets/images/images/images/image9.png')} 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาจุดหมายปลายทาง หรือ สไตล์เที่ยว"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleSearchChange('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );



  const renderFloatingButton = () => (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={handleFloatingButtonPress}
      activeOpacity={0.8}
    >
    <Image source={require('../assets/images/images/images/image27.png')} style={{height:21,width:21}}/>
    </TouchableOpacity>
  );

  // Loading State
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
    
    {/* Header */}
    <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white',marginLeft:16,marginRight:16}}>
      <Text style={styles.headerTitle}>หาเพื่อนเที่ยว</Text>
      <Image 
        source={require('../assets/images/images/images/image16.png')} 
        style={{width:18,height:18,flex:0.05}} 
      />
      <Image 
        source={require('../assets/images/images/images/image17.png')} 
        style={{width:15.75,height:18,flex:0.05,marginLeft:10}} 
      />
    </View>

    {/* Travel Styles Categories */}
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollContent}
      >
        {renderAllCategory()}
        {travelStyles.map(style => 
          renderTravelStyleItem(style, selectedTravelStyle === style.id)
        )}
      </ScrollView>
    </View>

    {/* Search Bar */}
    {renderSearchBar()}
    {/* Trip Count */}
    {renderTripCountText()}
    {/* Trips List */}
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
            {loading ? 'กำลังโหลด...' : 
             searchQuery ? `ไม่พบทริปที่ชื่อ "${searchQuery}"` : 
             'ไม่พบทริปในหมวดหมู่นี้'}
          </Text>
        </View>
      ) : (
        displayedTrips.map(trip => (
          <TripCard
          key={trip.id}
          trip={trip}
          isBookmarked={isTripBookmarked(trip.id)}
          onBookmarkToggle={handleBookmarkToggle}
          onTripPress={handleTripPress}
          onJoinTrip={handleJoinTrip}
          />
        ))
      )}
    </ScrollView>

    {/* Floating Action Button */}
    {renderFloatingButton()}

    {/* Bottom Navigation */}
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',paddingVertical:10,borderTopWidth:1,borderTopColor:'#E5E7EB'}}>
      <View style={{ alignItems: 'center'}}>
        <Image 
          source={require('../assets/images/images/images/image18.png')} 
          style={{ width: 24, height: 24,marginBottom:10}} 
        />
        <Text style={{fontSize: 12,fontFamily:'InterTight-Regular',color:'#6B7280',alignItems:'baseline' }}>หน้าหลัก</Text>
      </View>
      <View style={{alignItems:'center'}}>
        <Image 
          source={require('../assets/images/images/images/image19.png')} 
          style={{ width: 24, height: 24,marginBottom:10,tintColor:'#29C4AF'}} 
        />
        <Text style={{fontSize:12,fontFamily:'InterTight-Regular',color:'#29C4AF',alignItems:'baseline'}}>ค้นหา</Text>
      </View>
   <TouchableOpacity onPress={handlesavedTrips}>
   <View style={{alignItems:'center'}}>
        <Image 
          source={require('../assets/images/images/images/image21.png')} 
          style={{   height: 20, marginBottom:10,
            width: 15,}} 
        />
        <Text style={{fontSize:12,fontFamily:'InterTight-Regular',color:'#6B7280',alignItems:'baseline'}}>บันทึก</Text>
      </View>
   </TouchableOpacity>
     <TouchableOpacity onPress={handleProfile}>
     <View style={{alignItems:'center'}}>
        <Image 
          source={require('../assets/images/images/images/image20.png')} 
          style={{width: 24, height: 24 ,marginBottom:10}} 
        />
        <Text style={{fontSize:12,fontFamily:'InterTight-Regular',color:'#6B7280',alignItems:'baseline'}}>โปรไฟล์</Text>
      </View>
     </TouchableOpacity>
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerTitle: {
    flex:0.9,
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'left',
    paddingVertical: 16,
    fontWeight:500,
    lineHeight:18,
    fontFamily:'InterTight-SemiBold',
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
    backgroundColor: '#FFFFFFE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height:24,
    borderWidth:1,
    borderColor:'#E5E7EB'
  },
  dateIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily:'InterTight-SemiBold'
  },
  participantBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#4F46E5E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height:24
  },
  participantIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  participantText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily:'InterTight-SemiBold'
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
    lineHeight:18,
    fontFamily:'InterTight-SemiBold',
    fontWeight: 500,
    color: '#1F2937',
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
    color: '#4B5563',
    fontWeight:400,
    lineHeight:14,
    fontFamily:'InterTight-Regular'
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
    fontWeight:400,
    fontFamily:'InterTight-Regular'
  },
  atmosphere: {
    fontSize: 14,
    color: '#6366f1',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 8,
    fontFamily:'InterTight-Regular'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily:'InterTight-Regular',
    color: '#6b7280',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    fontFamily:'InterTight-Regular'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  serviceTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
    height:24
  },
  serviceTagText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '400',
   fontFamily:'InterTight-Regular'
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
    fontWeight: '500',
    color: '#1F2937',
    fontFamily:'InterTight-SemiBold',
  },
  ownerAge: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily:'InterTight-SemiBold',
  },
  joinButton: {
    backgroundColor: '#29C4AF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius:8,
    color:'#FFFFFF'
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily:'InterTight-Regular'

  },
  participantsInfo: {
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily:'InterTight-SemiBold',
  },
  categoriesContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor:'#FFFFFF',
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor:'#FFFFFF'
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    color:'#374151',
    gap: 8,
    height:34,
  },
  categoryItemActive: {
    backgroundColor: '#29C4AF',
    borderColor: '#29C4AF',
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
    fontWeight: '400',
    color: '#374151',
    fontFamily:'InterTight-SemiBold',
    
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
    backgroundColor: '#F9FAFB',
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
    color: '#ADAEBC',
    paddingVertical: 0,
    outlineColor:'#f5f5f5',
    lineHeight:24,
    fontFamily:'InterTight-Regular'
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
    backgroundColor: '#29C4AF',
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
    flexDirection:'row',
    alignItems:'center'
  },
  tripCountText: {
    fontSize: 14,
    flex:0.8,
    color: '#1F2937',
    fontFamily:'InterTight-SemiBold'
  },
});

export default FindTripScreen;

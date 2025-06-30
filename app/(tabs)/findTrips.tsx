import React, { useState, useEffect, useCallback,useRef  } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  FlatList
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { axiosInstance } from '../lib/axios';
import {Stack,useRouter} from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {requirements}  from '../requirement'
import axios from 'axios'
import {useFonts} from 'expo-font'
import TripCard from './TripCard'
import BottomNavigation from './customNavigation'
import styles from '../(tabs)/css/findTrip_css'
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

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_SEARCH_HISTORY = 10;

const FindTripScreen: React.FC = () => {
 
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [displayedTrips, setDisplayedTrips] = useState<Trip[]>([]);
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  // Changed to array to support multiple selection
  const [selectedTravelStyles, setSelectedTravelStyles] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarkedTripIds, setBookmarkedTripIds] = useState<string[]>([]);
  const [fontsLoaded] = useFonts({
    'CustomFont': require('../assets/fonts/InterTight-Black.ttf'),
    'InterTight-SemiBold': require('../assets/fonts/InterTight-SemiBold.ttf'),
    'InterTight-Regular':require('../assets/fonts/InterTight-Regular.ttf')
  });


   const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);


  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const router = useRouter();

   useEffect(() => {
    loadSearchHistory();
    return () => {
      isMountedRef.current = false;
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

   const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history && isMountedRef.current) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

    const saveSearchToHistory = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      const updatedHistory = [
        query,
        ...searchHistory.filter(item => item !== query)
      ].slice(0, MAX_SEARCH_HISTORY);
      
      if (isMountedRef.current) {
        setSearchHistory(updatedHistory);
        await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };


   const removeFromSearchHistory = async (query: string) => {
    try {
      const updatedHistory = searchHistory.filter(item => item !== query);
      
      if (isMountedRef.current) {
        setSearchHistory(updatedHistory);
        await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Failed to remove from search history:', error);
    }
  };

    const clearAllSearchHistory = async () => {
    try {
      if (isMountedRef.current) {
        setSearchHistory([]);
        await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      }
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };



  // Auto-refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Always fetch fresh data when screen is focused
      fetchTrips();
      fetchTravelStyles();
      
      if (userId) {
        loadBookmarkedTrips();
      }
    }, [userId])
  );




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
      const response = await axiosInstance.get('/bookmarks');
      console.log('Bookmarks API response:', response.data);
      
      if (response.status === 200 && response.data.data && Array.isArray(response.data.data)) {
        const tripIds = response.data.data.map((bookmark: any) => {
          return bookmark.tripId || bookmark.trip_id || bookmark.id || bookmark.trip?.id;
        }).filter(Boolean);
        
        setBookmarkedTripIds(tripIds);
        console.log(`Loaded bookmarked trips for user ${userId}:`, tripIds);
        
        // Auto-refresh trips after loading bookmarks
        if (tripIds.length > 0 || allTrips.length > 0) {
          fetchTrips();
        }
      } else {
        console.log('Unexpected response structure or empty data');
        setBookmarkedTripIds([]);
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
        setBookmarkedTripIds(prev => [...prev, trip.id]);
      } else {
        setBookmarkedTripIds(prev => prev.filter(id => id !== trip.id));
      }
      
      console.error('Failed to toggle bookmark:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data);
        if (error.response?.status === 401) {
          console.error('User not authenticated');
          setUserId(null);
        } else if (error.response?.status === 404) {
          console.error('Bookmark not found');
        }
      }
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
      console.log("Travel styles fetched:", response.data.data);
    } catch (error) {
      console.error('Error fetching travel styles:', error);
    }
  };

  const fetchTrips = async (): Promise<void> => {
    const accessToken = await AsyncStorage.getItem('googleAccessToken');
    console.log("GOOGLE TOKEN", accessToken);
    
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };
    
    try {
      const response = await axiosInstance.get(`${requirements.baseURL}/trips`, config);
     
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const publishedTrips = response.data.data.filter(trip => trip.status === "published");
        console.log('Fetched Published trips:', publishedTrips.length);
        setAllTrips(publishedTrips);
        filterTrips(publishedTrips, selectedTravelStyles);
      } else {
        setAllTrips([]);
        setFilteredTrips([]);
        setDisplayedTrips([]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setAllTrips([]);
      setFilteredTrips([]);
      setDisplayedTrips([]);
    } finally {
      setRefreshing(false);
    }
  };

  // Updated filter function to handle multiple travel styles
  const filterTrips = (trips: Trip[], styleIds: string[]): void => {
    console.log('Filtering trips for styles:', styleIds);
    console.log('Total trips to filter:', trips.length);
    
    let filtered: Trip[];
    
    if (styleIds.includes('all') || styleIds.length === 0) {
      console.log('Showing all trips');
      filtered = trips;
    } else {
      // Get style titles for the given IDs
      const selectedStyles = travelStyles.filter(style => styleIds.includes(style.id));
      const styleTitles = selectedStyles.map(style => style.title);
      console.log(`Filtering for styleIds: ${styleIds}, styleTitles: ${styleTitles}`);

      filtered = trips.filter(trip => {
        // Check if trip has any of the selected travel styles (by ID or title)
        const hasStyleById = trip.travelStyles?.some(style => styleIds.includes(style));
        const hasStyleByTitle = trip.travelStyles?.some(style => styleTitles.includes(style));
        
        // Also check tripOwner's travel styles
        const ownerHasStyle = trip.tripOwner?.travelStyles?.some(style => styleIds.includes(style));
        
        const matches = hasStyleById || hasStyleByTitle;
        
        if (matches) {
          console.log(`Trip "${trip.name}" matches selected styles:`, {
            tripStyles: trip.travelStyles,
            ownerStyles: trip.tripOwner?.travelStyles,
            hasStyleById,
            hasStyleByTitle,
            ownerHasStyle
          });
        }
        
        return matches;
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
      trip.name.toLowerCase().includes(query.toLowerCase()) ||
      trip.destinations.some(dest => dest.toLowerCase().includes(query.toLowerCase()))
    );
    
    console.log('Search results count:', searchResults.length);
    setDisplayedTrips(searchResults);
  };

  const handleTripPress = useCallback(async (trip: Trip) => {
    try {
      console.log("Trip card pressed");
      
      const userId = await AsyncStorage.getItem('userId');
      console.log("Trip Pressed");
      console.log("Trip ID:", trip.id);
      console.log("Trip Owner ID:", trip.tripOwnerId || trip.tripOwner?.id);
      console.log("Current User ID:", userId);
      
      if (!userId) {
        console.error('No user ID found in storage');
        return;
      }
      
      const ownerId = trip.tripOwnerId;
      
      if (userId === ownerId) {
        console.log("Edit Trip - User is owner");
        router.push(`/EditTrip?tripId=${trip.id}`);
      } else {
        console.log("View Trip - User is not owner");
        console.log("User is not the owner, no action taken");
      }
      
    } catch (error) {
      console.error('Error handling trip press:', error);
 
    }
  }, [router]);

  // Updated travel style press handler for multiple selection
  const handleTravelStylePress = (styleId: string): void => {
    console.log('Travel style selected:', styleId);
    
    if (styleId === 'all') {
      // If "all" is selected, clear other selections
      setSelectedTravelStyles(['all']);
    } else {
      setSelectedTravelStyles(prev => {
        // Remove 'all' if it was selected
        const withoutAll = prev.filter(id => id !== 'all');
        
        if (withoutAll.includes(styleId)) {
          // If style is already selected, remove it
          const newSelection = withoutAll.filter(id => id !== styleId);
          // If no styles selected, default to 'all'
          return newSelection.length === 0 ? ['all'] : newSelection;
        } else {
          // Add the new style
          return [...withoutAll, styleId];
        }
      });
    }
  };

  // Update filter when selectedTravelStyles changes
  useEffect(() => {
    if (allTrips.length > 0) {
      filterTrips(allTrips, selectedTravelStyles);
    }
  }, [selectedTravelStyles, allTrips, travelStyles]);

  const handleJoinTrip = async (trip: Trip): Promise<void> => {
    try {
      console.log('Join trip:', trip.id);
      
      const accessToken = await AsyncStorage.getItem('googleAccessToken');
      const idToken = await AsyncStorage.getItem('googleIdToken');
      
      console.log('Access Token:', accessToken ? 'Present' : 'Not found');
      console.log('ID Token:', idToken ? 'Present' : 'Not found');
      
      if (!accessToken && !idToken) {
        console.error('No access token or ID token found');
        return;
      }
      
      const bodyParameters = {};
      
      const makeJoinRequest = async (token: string, tokenType: string) => {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axiosInstance.post(
          `${requirements.baseURL}/trips/join/${trip.id}`,
          bodyParameters,
          config
        );
        
        console.log(`Response with ${tokenType}:`, response.data);
        return response;
      };
      
      let lastError: any = null;
      
      if (idToken) {
        try {
          await makeJoinRequest(idToken, 'ID Token');
          router.push(`/stramChat?tripId=${trip.id}`);
          return;
        } catch (err) {
          console.warn('Failed with ID Token:', err);
          lastError = err;
        }
      }
      
      if (accessToken) {
        try {
          await makeJoinRequest(accessToken, 'Access Token');
          router.push(`/stramChat?tripId=${trip.id}`);
          return;
        } catch (err) {
          console.error('Failed with Access Token:', err);
          lastError = err;
        }
      }
      
      throw lastError || new Error('Failed to join trip with available tokens');
      
    } catch (error) {
      console.error('Error joining trip:', error);
      if (error.response?.status === 404) {
        return;
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message;
        if (message === 'คุณเป็นสมาชิกของทริปนี้แล้ว') {
          router.push(`/stramChat?tripId=${trip.id}`);
        } else if (message === 'ทริปนี้เต็มแล้ว') {
          return;
        }
      } else {
        return;
      }
    }
  };

  const handleSearchChange = (text: string): void => {
    setSearchQuery(text);
    
    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Debounce search to prevent excessive API calls
    searchTimeout.current = setTimeout(() => {
      if (isMountedRef.current) {
        applySearchFilter(filteredTrips, text);
        
        // Save to history when user finishes typing (after 1 second)
        if (text.trim().length > 0) {
          saveSearchToHistory(text.trim());
        }
      }
    }, 300);
  };

   const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      saveSearchToHistory(searchQuery.trim());
      setShowSearchHistory(false);
      setIsSearchFocused(false);
    }
  };


    const handleHistorySelect = (query: string) => {
    setSearchQuery(query);
    applySearchFilter(filteredTrips, query);
    setShowSearchHistory(false);
    setIsSearchFocused(false);
    // Move to top of history
    saveSearchToHistory(query);
  };


  const handleFloatingButtonPress = (): void => {
    console.log('Floating button pressed');
    router.push('/createTrip')
  };

  const onRefresh = (): void => {
    setRefreshing(true);
    // Fetch fresh data from server
    Promise.all([
      fetchTrips(),
      fetchTravelStyles(),
      userId ? loadBookmarkedTrips() : Promise.resolve()
    ]).finally(() => {
      setRefreshing(false);
    });
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTravelStyles(),
        fetchTrips()
      ]);
    };
    loadData();
  }, []);

  // Updated render function to show multiple selection
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

  // Render All Categories
  const renderAllCategory = () => (
    <TouchableOpacity
      key="all"
      style={[
        styles.categoryItem,
        selectedTravelStyles.includes('all') && styles.categoryItemActive
      ]}
      onPress={() => handleTravelStylePress('all')}
    >
      <Text style={[
        styles.categoryText,
        selectedTravelStyles.includes('all') && styles.categoryTextActive
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
          onFocus={() => {
            setIsSearchFocused(true);
            setShowSearchHistory(searchHistory.length > 0);
          }}
          onBlur={() => {
            // Delay hiding to allow history selection
            setTimeout(() => {
              if (isMountedRef.current) {
                setIsSearchFocused(false);
                setShowSearchHistory(false);
              }
            }, 200);
          }}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              handleSearchChange('');
              setShowSearchHistory(false);
            }}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Search History Dropdown */}
      {showSearchHistory && isSearchFocused && searchHistory.length > 0 && (
        <View style={styles.searchHistoryContainer}>
          <View style={styles.searchHistoryHeader}>
            <Text style={styles.searchHistoryTitle}>Recent Searches</Text>
            <TouchableOpacity 
              onPress={clearAllSearchHistory}
              style={styles.clearAllButton}
            >
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={searchHistory}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <TouchableOpacity
                  style={styles.historyItemContent}
                  onPress={() => handleHistorySelect(item)}
                >
                  <Image 
                    source={require('../assets/images/images/images/clock.png')} // clock icon
                    style={styles.historyIcon}
                  />
                  <Text style={styles.historyText}>{item}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeHistoryButton}
                  onPress={() => removeFromSearchHistory(item)}
                >
                  <Text style={styles.removeHistoryText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            style={styles.historyList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
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
            renderTravelStyleItem(style, selectedTravelStyles.includes(style.id))
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
              {searchQuery ? `ไม่พบทริปที่ชื่อ "${searchQuery}"` : 'ไม่พบทริปในหมวดหมู่นี้'}
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
      <BottomNavigation currentScreen="findTrips" userId={userId} />
    </View>
  );
};

export default FindTripScreen;

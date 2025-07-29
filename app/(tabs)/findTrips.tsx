import React, { useState, useEffect, useCallback, useRef, use } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
// Components
import TripCard from '../../components/TripCard';
import BottomNavigation from '../../components/customNavigation';
import { SearchBar } from '../../components/SearchBar';
import { TravelStyleCategories } from '../../components/TravelStyleCategories';
import { TripCountHeader } from '../../components/TripCountHeader';
import  HeaderSection  from '../../components/HeaderSection';
import { EmptyState } from '../../components/EmptyState';

// Hooks
import { useTrips } from '../../features/trip/hooks/useTrips';
import { useTravelStyles } from '../../features/trip/hooks/useTravelStyles';
import { useBookmarks } from '../../features/trip/hooks/useBookmarks';
import { useSearchHistory } from '../../features/trip/hooks/useSearchHistory';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useTripFilters } from '../../features/trip/hooks/useTripFilter';
import { useNavigationService } from '../../services/useNavigationServices';

// Styles
import styles from '../../css/findTrip_css';

const FindTripScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Custom hooks
  const { userId } = useAuth();
  const { allTrips, loading: tripsLoading, fetchTrips, joinTrip } = useTrips();
  const { travelStyles, fetchTravelStyles } = useTravelStyles();
  const { isBookmarked, toggleBookmark, loadBookmarkedTrips } = useBookmarks(userId);
  const { 
    searchHistory, 
    saveSearchToHistory, 
    removeFromSearchHistory, 
    clearAllSearchHistory 
  } = useSearchHistory();
  
  // Updated useTripFilters hook with new features
  const {
    selectedTravelStyles,
    searchQuery,
    displayedTrips,
    dateRange,
    priceRange,
    hasActiveFilters,
    handleTravelStylePress,
    handleSearchChange,
    applyFilters,
    clearAllFilters
  } = useTripFilters(allTrips, travelStyles);

  const { handleTripPress, handleJoinTripSuccess, handleCreateTrip } = useNavigationService();

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Focus effect for data fetching
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await Promise.all([
          fetchTrips(),
          fetchTravelStyles(),
          userId ? loadBookmarkedTrips() : Promise.resolve()
        ]);
      };
      loadData();
    }, [userId, fetchTrips, fetchTravelStyles, loadBookmarkedTrips])
  );

  // Existing handlers
  const handleBookmarkToggle = useCallback(async (trip: any) => {
    try {
      await toggleBookmark(trip.id);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  }, [toggleBookmark]);

  const handleJoinTrip = useCallback(async (trip: any): Promise<void> => {
    try {
      const success = await joinTrip(trip.id);
      if (success) {
        handleJoinTripSuccess(trip.id);
      }
    } catch (error: any) {
      console.error('Error joining trip:', error);
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message;
        if (message === 'คุณเป็นสมาชิกของทริปนี้แล้ว') {
          handleJoinTripSuccess(trip.id);
        }
      }
    }
  }, [joinTrip, handleJoinTripSuccess]);

  const handleSearchChangeWithDebounce = useCallback((text: string): void => {
    handleSearchChange(text);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      if (isMountedRef.current && text.trim().length > 0) {
        saveSearchToHistory(text.trim());
      }
    }, 300);
  }, [handleSearchChange, saveSearchToHistory]);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      saveSearchToHistory(searchQuery.trim());
      setShowSearchHistory(false);
      setIsSearchFocused(false);
    }
  }, [searchQuery, saveSearchToHistory]);

  const handleHistorySelect = useCallback((query: string) => {
    handleSearchChange(query);
    setShowSearchHistory(false);
    setIsSearchFocused(false);
    saveSearchToHistory(query);
  }, [handleSearchChange, saveSearchToHistory]);

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
    setShowSearchHistory(searchHistory.length > 0);
  }, [searchHistory.length]);

  const handleSearchBlur = useCallback(() => {
    setTimeout(() => {
      if (isMountedRef.current) {
        setIsSearchFocused(false);
        setShowSearchHistory(false);
      }
    }, 200);
  }, []);

  // Handler for applying filters from modal
  const handleApplyFilters = useCallback((filters: {
    startDate: Date | null;
    endDate: Date | null;
    priceRange: {
      id: string;
      label: string;
      min: number;
      max: number;
    };
  }) => {
    applyFilters(filters);
  }, [applyFilters]);

  // Refresh handler
  const onRefresh = useCallback((): void => {
    setRefreshing(true);
    Promise.all([
      fetchTrips(),
      fetchTravelStyles(),
      userId ? loadBookmarkedTrips() : Promise.resolve()
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [fetchTrips, fetchTravelStyles, userId, loadBookmarkedTrips]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <HeaderSection />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChangeWithDebounce}
        onSearchSubmit={handleSearchSubmit}
        searchHistory={searchHistory}
        showSearchHistory={showSearchHistory}
        isSearchFocused={isSearchFocused}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
        onHistorySelect={handleHistorySelect}
        onRemoveFromHistory={removeFromSearchHistory}
        onClearAllHistory={clearAllSearchHistory}
      />

      <TravelStyleCategories 
        travelStyles={travelStyles}
        selectedTravelStyles={selectedTravelStyles}
        onTravelStylePress={handleTravelStylePress}
      />
      
      <TripCountHeader 
        count={displayedTrips.length}
        onApplyFilters={handleApplyFilters}
        currentDateRange={dateRange}
        currentPriceRange={priceRange}
        hasActiveFilters={hasActiveFilters}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {displayedTrips.length === 0 ? (
          <EmptyState 
            searchQuery={searchQuery}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAllFilters}
          />
        ) : (
          displayedTrips.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              isBookmarked={isBookmarked(trip.id)}
              onBookmarkToggle={handleBookmarkToggle}
              onTripPress={handleTripPress}
              onJoinTrip={handleJoinTrip}
              iscreateTrip={false}
              handleUserProfile={
                     async (user)=>{
                
                           if(user.userId===userId){
                            router.push(`/userProfile?userId=${userId}`);
                           }
                           else{
                             /*router.push({
                              pathname:'/PF_104',
                              params:{owner:JSON.stringify(user)}
                             })*/
router.push({
  pathname: '/(tabs)/PF_105',
  params: { userId: user.userId },
});


                           }
                     }
              }
            />
          ))
        )}
      </ScrollView>

      <BottomNavigation currentScreen="findTrips" userId={userId} />
    </View>
  );
};

export default FindTripScreen;
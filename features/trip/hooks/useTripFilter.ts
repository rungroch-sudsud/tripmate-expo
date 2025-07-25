// hooks/useTripFilters.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Trip } from './useTrips';
import { Category } from './useTravelStyles';

export const useTripFilters = (allTrips: Trip[], travelStyles: Category[]) => {
  const [selectedTravelStyles, setSelectedTravelStyles] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [displayedTrips, setDisplayedTrips] = useState<Trip[]>([]);
  
  // New filter states
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null
  });
  
  const [priceRange, setPriceRange] = useState<{
    id: string;
    label: string;
    min: number;
    max: number;
  }>({
    id: 'all',
    label: 'ทุกราคา',
    min: 0,
    max: Infinity
  });

  // Helper function to check if trip dates overlap with selected date range
  const isDateInRange = useCallback((tripStartDate: string, tripEndDate: string): boolean => {
    if (!dateRange.startDate || !dateRange.endDate) return true;
    
    const tripStart = new Date(tripStartDate);
    const tripEnd = new Date(tripEndDate);
    const filterStart = dateRange.startDate;
    const filterEnd = dateRange.endDate;
    
    // Check if there's any overlap between trip dates and filter dates
    return (tripStart <= filterEnd && tripEnd >= filterStart);
  }, [dateRange]);

  // Helper function to check if trip price is within selected price range
  const isPriceInRange = useCallback((tripPrice: number): boolean => {
    if (priceRange.id === 'all') return true;
    return tripPrice >= priceRange.min && tripPrice <= priceRange.max;
  }, [priceRange]);

  const filterTrips = useCallback((trips: Trip[], styleIds: string[]): Trip[] => {
    if (styleIds.includes('all') || styleIds.length === 0) {
      return trips;
    }
         
    const selectedStyles = travelStyles.filter(style => styleIds.includes(style.id));
    const styleTitles = selectedStyles.map(style => style.title);
         
    return trips.filter(trip => {
      const hasStyleById = trip.travelStyles?.some(style => styleIds.includes(style));
      const hasStyleByTitle = trip.travelStyles?.some(style => styleTitles.includes(style));
      return hasStyleById || hasStyleByTitle;
    });
  }, [travelStyles]);

  const applySearchFilter = useCallback((trips: Trip[], query: string): Trip[] => {
    if (!query.trim()) {
      return trips;
    }

    return trips.filter(trip =>
      trip.name.toLowerCase().includes(query.toLowerCase()) ||
      trip.destinations.some(dest => dest.toLowerCase().includes(query.toLowerCase()))
    );
  }, []);

  // New function to apply date and price filters
  const applyDateAndPriceFilters = useCallback((trips: Trip[]): Trip[] => {
    return trips.filter(trip => {
      const dateMatch = isDateInRange(trip.startDate, trip.endDate);
      const priceMatch = isPriceInRange(trip.pricePerPerson);
      return dateMatch && priceMatch;
    });
  }, [isDateInRange, isPriceInRange]);

  const handleTravelStylePress = useCallback((styleId: string): void => {
    if (styleId === 'all') {
      setSelectedTravelStyles(['all']);
    } else {
      setSelectedTravelStyles(prev => {
        const withoutAll = prev.filter(id => id !== 'all');
                 
        if (withoutAll.includes(styleId)) {
          const newSelection = withoutAll.filter(id => id !== styleId);
          return newSelection.length === 0 ? ['all'] : newSelection;
        } else {
          return [...withoutAll, styleId];
        }
      });
    }
  }, []);

  const handleSearchChange = useCallback((text: string): void => {
    setSearchQuery(text);
  }, []);

  // New handlers for date and price filters
  const handleDateRangeChange = useCallback((startDate: Date | null, endDate: Date | null): void => {
    setDateRange({ startDate, endDate });
  }, []);

  const handlePriceRangeChange = useCallback((newPriceRange: {
    id: string;
    label: string;
    min: number;
    max: number;
  }): void => {
    setPriceRange(newPriceRange);
  }, []);

  // Function to apply all filters from modal
  const applyFilters = useCallback((filters: {
    startDate: Date | null;
    endDate: Date | null;
    priceRange: {
      id: string;
      label: string;
      min: number;
      max: number;
    };
  }): void => {
    setDateRange({
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    setPriceRange(filters.priceRange);
  }, []);

  // Function to clear all filters
  const clearAllFilters = useCallback((): void => {
    setSelectedTravelStyles(['all']);
    setSearchQuery('');
    setDateRange({ startDate: null, endDate: null });
    setPriceRange({
      id: 'all',
      label: 'ทุกราคา',
      min: 0,
      max: Infinity
    });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo((): boolean => {
    return (
      !selectedTravelStyles.includes('all') ||
      searchQuery.trim() !== '' ||
      dateRange.startDate !== null ||
      dateRange.endDate !== null ||
      priceRange.id !== 'all'
    );
  }, [selectedTravelStyles, searchQuery, dateRange, priceRange]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    let result = allTrips;
    
    // Apply travel style filter
    result = filterTrips(result, selectedTravelStyles);
    
    // Apply search filter
    result = applySearchFilter(result, searchQuery);
    
    // Apply date and price filters
    result = applyDateAndPriceFilters(result);
    
    setFilteredTrips(result);
    setDisplayedTrips(result);
  }, [
    allTrips, 
    selectedTravelStyles, 
    searchQuery, 
    dateRange, 
    priceRange,
    filterTrips, 
    applySearchFilter, 
    applyDateAndPriceFilters
  ]);

  return {
    // Existing returns
    selectedTravelStyles,
    searchQuery,
    filteredTrips,
    displayedTrips,
    handleTravelStylePress,
    handleSearchChange,
    
    // New returns for date and price filtering
    dateRange,
    priceRange,
    handleDateRangeChange,
    handlePriceRangeChange,
    applyFilters,
    clearAllFilters,
    hasActiveFilters
  };
};
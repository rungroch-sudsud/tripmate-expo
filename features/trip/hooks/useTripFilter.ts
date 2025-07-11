import { useState, useEffect, useCallback, useMemo } from 'react';
import { Trip } from './useTrips';
import { Category } from './useTravelStyles';

export const useTripFilters = (allTrips: Trip[], travelStyles: Category[]) => {
  const [selectedTravelStyles, setSelectedTravelStyles] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [displayedTrips, setDisplayedTrips] = useState<Trip[]>([]);

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

  // Apply filters whenever dependencies change
  useEffect(() => {
    const filtered = filterTrips(allTrips, selectedTravelStyles);
    setFilteredTrips(filtered);
    
    const searched = applySearchFilter(filtered, searchQuery);
    setDisplayedTrips(searched);
  }, [allTrips, selectedTravelStyles, searchQuery, filterTrips, applySearchFilter]);

  return {
    selectedTravelStyles,
    searchQuery,
    filteredTrips,
    displayedTrips,
    handleTravelStylePress,
    handleSearchChange
  };
};
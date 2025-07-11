import { useState, useCallback } from 'react';
import { axiosInstance } from '../../../lib/axios';
import axios from 'axios';

export const useBookmarks = (userId: string | null) => {
  const [bookmarkedTripIds, setBookmarkedTripIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarkedTrips = useCallback(async (): Promise<void> => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get('/bookmarks');
      
      if (response.status === 200 && response.data.data && Array.isArray(response.data.data)) {
        const tripIds = response.data.data.map((bookmark: any) => {
          return bookmark.tripId || bookmark.trip_id || bookmark.id || bookmark.trip?.id;
        }).filter(Boolean);
        
        setBookmarkedTripIds(tripIds);
      } else {
        setBookmarkedTripIds([]);
      }
    } catch (err) {
      console.error('Failed to load bookmarked trips:', err);
      setError('Failed to load bookmarks');
      
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setBookmarkedTripIds([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const toggleBookmark = useCallback(async (tripId: string): Promise<void> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const isCurrentlyBookmarked = bookmarkedTripIds.includes(tripId);
    
    // Optimistic update
    if (isCurrentlyBookmarked) {
      setBookmarkedTripIds(prev => prev.filter(id => id !== tripId));
    } else {
      setBookmarkedTripIds(prev => [...prev, tripId]);
    }

    try {
      if (isCurrentlyBookmarked) {
        await axiosInstance.delete(`/bookmarks/${tripId}`);
      } else {
        await axiosInstance.post(`/bookmarks/${tripId}`);
      }
    } catch (err) {
      // Revert optimistic update on error
      if (isCurrentlyBookmarked) {
        setBookmarkedTripIds(prev => [...prev, tripId]);
      } else {
        setBookmarkedTripIds(prev => prev.filter(id => id !== tripId));
      }
      
      console.error('Failed to toggle bookmark:', err);
      throw err;
    }
  }, [userId, bookmarkedTripIds]);

  const isBookmarked = useCallback((tripId: string): boolean => {
    return bookmarkedTripIds.includes(tripId);
  }, [bookmarkedTripIds]);

  return {
    bookmarkedTripIds,
    loading,
    error,
    loadBookmarkedTrips,
    toggleBookmark,
    isBookmarked
  };
};
import { create } from 'zustand';
import {axiosInstance} from '../lib/axios';

interface BookmarkState {
  bookmarkedTripIds: string[];
  loading: boolean;
  userId: string | null;
  setUserId: (userId: string | null) => void;
  loadBookmarkedTrips: () => Promise<void>;
  toggleBookmark: (tripId: string) => Promise<void>;
  isBookmarked: (tripId: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarkedTripIds: [],
  loading: false,
  userId: null,
  
  setUserId: (userId) => set({ userId }),
  
  loadBookmarkedTrips: async () => {
    const { userId } = get();
    if (!userId) return;
    
    set({ loading: true });
    try {
      const response = await axiosInstance.get('/bookmarks');
      
      if (response.status === 200 && response.data.data && Array.isArray(response.data.data)) {
        const tripIds = response.data.data.map((bookmark: any) => {
          return bookmark.tripId || bookmark.trip_id || bookmark.id || bookmark.trip?.id;
        }).filter(Boolean);
        
        set({ bookmarkedTripIds: tripIds });
      } else {
        set({ bookmarkedTripIds: [] });
      }
    } catch (error) {
      console.error('Failed to load bookmarked trips:', error);
      set({ bookmarkedTripIds: [] });
    } finally {
      set({ loading: false });
    }
  },
  
  toggleBookmark: async (tripId: string) => {
    const { userId, bookmarkedTripIds } = get();
    if (!userId) return;
    
    const isCurrentlyBookmarked = bookmarkedTripIds.includes(tripId);
    
    // Optimistic update
    if (isCurrentlyBookmarked) {
      set({ bookmarkedTripIds: bookmarkedTripIds.filter(id => id !== tripId) });
    } else {
      set({ bookmarkedTripIds: [...bookmarkedTripIds, tripId] });
    }
    
    try {
      if (isCurrentlyBookmarked) {
        await axiosInstance.delete(`/bookmarks/${tripId}`);
      } else {
        await axiosInstance.post(`/bookmarks/${tripId}`);
      }
    } catch (error) {
      // Revert on error
      if (isCurrentlyBookmarked) {
        set({ bookmarkedTripIds: [...bookmarkedTripIds, tripId] });
      } else {
        set({ bookmarkedTripIds: bookmarkedTripIds.filter(id => id !== tripId) });
      }
      console.error('Failed to toggle bookmark:', error);
    }
  },
  
  isBookmarked: (tripId: string) => {
    return get().bookmarkedTripIds.includes(tripId);
  }
}));
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_SEARCH_HISTORY = 10;

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSearchHistory = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSearchToHistory = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) return;
    
    try {
      const updatedHistory = [
        query,
        ...searchHistory.filter(item => item !== query)
      ].slice(0, MAX_SEARCH_HISTORY);
      
      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [searchHistory]);

  const removeFromSearchHistory = useCallback(async (query: string): Promise<void> => {
    try {
      const updatedHistory = searchHistory.filter(item => item !== query);
      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to remove from search history:', error);
    }
  }, [searchHistory]);

  const clearAllSearchHistory = useCallback(async (): Promise<void> => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]);

  return {
    searchHistory,
    loading,
    saveSearchToHistory,
    removeFromSearchHistory,
    clearAllSearchHistory
  };
};
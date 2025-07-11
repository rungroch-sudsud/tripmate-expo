import { useState, useCallback } from 'react';
import { axiosInstance } from '../../../lib/axios';

export interface Category {
  id: string;
  title: string;
}

export const useTravelStyles = () => {
  const [travelStyles, setTravelStyles] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTravelStyles = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get('/travel-styles');
      setTravelStyles(response.data.data);
    } catch (err) {
      console.error('Error fetching travel styles:', err);
      setError('Failed to fetch travel styles');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    travelStyles,
    loading,
    error,
    fetchTravelStyles
  };
};

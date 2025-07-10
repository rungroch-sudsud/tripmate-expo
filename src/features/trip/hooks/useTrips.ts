import { useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../../../lib/axios';
import { requirements } from '../../../../requirement';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Trip {
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
  participants: any[];
  travelStyles: string[];
  tripCoverImageUrl: string;
  pricePerPerson: number;
  detail: string;
  tripOwner: any;
}

export const useTrips = () => {
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const accessToken = await AsyncStorage.getItem('googleAccessToken');
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      };
      
      const response = await axiosInstance.get(`${requirements.baseURL}/trips`, config);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const publishedTrips = response.data.data.filter(trip => trip.status === "published");
        setAllTrips(publishedTrips);
      } else {
        setAllTrips([]);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to fetch trips');
      setAllTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const joinTrip = useCallback(async (tripId: string): Promise<boolean> => {
    try {
      const accessToken = await AsyncStorage.getItem('googleAccessToken');
      const idToken = await AsyncStorage.getItem('googleIdToken');
      
      if (!accessToken && !idToken) {
        throw new Error('No authentication token found');
      }
      
      const makeJoinRequest = async (token: string) => {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        return await axiosInstance.post(
          `${requirements.baseURL}/trips/join/${tripId}`,
          {},
          config
        );
      };
      
      // Try with ID token first, then access token
      try {
        if (idToken) {
          await makeJoinRequest(idToken);
          return true;
        }
      } catch (err) {
        console.warn('Failed with ID Token:', err);
      }
      
      if (accessToken) {
        await makeJoinRequest(accessToken);
        return true;
      }
      
      throw new Error('Failed to join trip with available tokens');
      
    } catch (error: any) {
      console.error('Error joining trip:', error);
      
      if (error.response?.status === 400) {
        const message = error.response?.data?.message;
        if (message === 'คุณเป็นสมาชิกของทริปนี้แล้ว') {
          return true; // Already a member
        }
        if (message === 'ทริปนี้เต็มแล้ว') {
          throw new Error('Trip is full');
        }
      }
      
      throw error;
    }
  }, []);

  return {
    allTrips,
    loading,
    error,
    fetchTrips,
    joinTrip
  };
};
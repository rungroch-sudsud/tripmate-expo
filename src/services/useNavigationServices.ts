import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../features/trip/schemas/trip-form.schema';

export const useNavigationService = () => {
  const router = useRouter();

  const handleTripPress = useCallback(async (trip: Trip): Promise<void> => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        console.error('No user ID found in storage');
        return;
      }
      
      const ownerId = trip.tripOwnerId;
      
      if (userId === ownerId) {
        router.push(`/EditTrip?tripId=${trip.id}`);
      } else {
        console.log("User is not the owner, no action taken");
      }
    } catch (error) {
      console.error('Error handling trip press:', error);
    }
  }, [router]);

  const handleJoinTripSuccess = useCallback((tripId: string): void => {
    router.push(`/streamChat?tripId=${tripId}`);
  }, [router]);

  const handleCreateTrip = useCallback((): void => {
    router.push('/createTrip');
  }, [router]);

  return {
    handleTripPress,
    handleJoinTripSuccess,
    handleCreateTrip
  };
};
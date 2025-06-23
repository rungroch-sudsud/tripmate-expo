import { StreamChat } from 'stream-chat';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Channel,
  Chat,
  Window,
  Thread,
  MessageList,
  MessageInput
} from 'stream-chat-react';
import TripCard from './TripCard';
import type { Channel as StreamChannel } from 'stream-chat';
import { useRouter, useLocalSearchParams, router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  BackHandler 
} from 'react-native';
import { axiosInstance } from '../lib/axios';
import { requirements } from '../requirement';
import CustomChannelHeader from './customChannelHeader';
import ProductionCustomMessage from './customMessage';
import 'stream-chat-react/css/v2/index.css'


// Enhanced interfaces with better typing
interface TripParticipant {
  userId: string;
  fullname: string;
  nickname: string;
  profileImageUrl: string;
  age: number;
  email: string;
}

interface Trip {
  id: string;
  name: string;
  participants: string[];
  tripOwnerId: string;
  destinations: string[];
  detail: string;
  endDate: string;
  startDate: string;
  groupAtmosphere: string;
  includedServices: string[];
  maxParticipants: number;
  pricePerPerson: number;
  status: string;
  travelStyles: string[];
  tripCoverImageUrl: string;
}

interface TravelStyle {
  id: string;
  title: string;
  iconImageUrl: string;
  activeIconImageUrl: string;
}

interface Service {
  id: string;
  title: string;
}

interface ChatUser {
  id: string;
  name: string;
  image: string;
}

interface ChatState {
  client: StreamChat | null;
  channel: StreamChannel | null;
  currentUser: ChatUser | null;
  isLoading: boolean;
  error: string | null;
}

// Constants
const DEFAULT_AVATAR = 'https://via.placeholder.com/40x40/cccccc/666666?text=👤';
const RECONNECTION_DELAY = 2000;
const MAX_RETRY_ATTEMPTS = 3;

// Custom hooks for better separation of concerns
const useTripData = (tripId: string) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<TripParticipant[]>([]);
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTripDetails = useCallback(async () => {
    if (!tripId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const tripResponse = await axiosInstance.get(`/trips/${tripId}`);
      const tripData = tripResponse.data.data;
      
      if (!tripData) {
        throw new Error('Trip data not found');
      }
      
      setTrip(tripData);

      // Process participants with better error handling
      const participantIds = tripData.participants
        ?.map((participant: any) => {
          if (typeof participant === 'string') return participant;
          if (participant?.userId) return participant.userId;
          return null;
        })
        .filter(Boolean) || [];

      const allParticipantIds = Array.from(new Set([
        tripData.tripOwnerId,
        ...participantIds
      ]));

      // Fetch all participants concurrently with error handling
      const participantResults = await Promise.allSettled(
        allParticipantIds.map(async (userId: string) => {
          const userResponse = await axiosInstance.get(`/users/profile/${userId}`);
          return userResponse.data?.data;
        })
      );

      const validParticipants = participantResults
        .filter((result): result is PromiseFulfilledResult<TripParticipant> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      if (validParticipants.length === 0) {
        throw new Error('No valid participants found');
      }
      
      setParticipants(validParticipants);

      // Fetch additional data (non-critical)
      try {
        const [travelStylesResponse, servicesResponse] = await Promise.all([
          axiosInstance.get('/travel-styles'),
          axiosInstance.get('/services')
        ]);

        setTravelStyles(travelStylesResponse.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          iconImageUrl: item.iconImageUrl,
          activeIconImageUrl: item.activeIconImageUrl || item.iconImageUrl,
        })));

        setServices(servicesResponse.data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
        })));
      } catch (additionalDataError) {
        console.warn('Failed to fetch additional data:', additionalDataError);
      }

      return { tripData, participantProfiles: validParticipants };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trip details';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  return {
    trip,
    participants,
    travelStyles,
    services,
    loading,
    error,
    fetchTripDetails
  };
};

const useCurrentUser = () => {
  const getCurrentUser = useCallback(async (participantProfiles: TripParticipant[]): Promise<ChatUser> => {
    const userId = await AsyncStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('User not logged in');
    }

    const userProfile = participantProfiles.find(p => p.userId === userId);
    
    if (!userProfile) {
      throw new Error('You are not a participant in this trip');
    }

    return {
      id: userProfile.userId,
      name: userProfile.nickname || userProfile.fullname,
      image: userProfile.profileImageUrl !== 'N/A' 
        ? userProfile.profileImageUrl 
        : DEFAULT_AVATAR
    };
  }, []);

  return { getCurrentUser };
};

export default function TripGroupChat() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tripId = params.tripId as string;



  //Memory Leak Performance

  // Hooks
  const { 
    trip, 
    participants, 
    travelStyles, 
    services, 
    loading: tripLoading, 
    error: tripError, 
    fetchTripDetails 
  } = useTripData(tripId);
  
  const { getCurrentUser } = useCurrentUser();

  // Chat state
  const [chatState, setChatState] = useState<ChatState>({
    client: null,
    channel: null,
    currentUser: null,
    isLoading: false,
    error: null
  });

  // Refs
  const isMountedRef = useRef(true);
  const clientRef = useRef<StreamChat | null>(null);
  const retryCountRef = useRef(0);

  // Memoized values
  const isLoading = useMemo(() => 
    tripLoading || chatState.isLoading, 
    [tripLoading, chatState.isLoading]
  );

  const error = useMemo(() => 
    tripError || chatState.error, 
    [tripError, chatState.error]
  );

  // Chat initialization with retry logic
  const initializeChat = useCallback(async (tripData: any, participantProfiles: TripParticipant[]) => {
    if (!isMountedRef.current) return;

    try {
      setChatState(prev => ({ ...prev, isLoading: true, error: null }));

      const user = await getCurrentUser(participantProfiles);
      console.log('🔵 Initializing chat for user:', user.id);

      let chatClient = clientRef.current;
      
      if (!chatClient) {
        chatClient = StreamChat.getInstance(requirements.stream_api_key);
        clientRef.current = chatClient;
      }

      // Handle user connection
      if (chatClient.userID && chatClient.userID !== user.id) {
        console.log('🔄 Disconnecting previous user:', chatClient.userID);
        await chatClient.disconnectUser();
      }

      if (chatClient.userID !== user.id) {
        console.log('🔵 Connecting user to Stream Chat:', user.id);
        await chatClient.connectUser(user, chatClient.devToken(user.id));
        console.log('✅ User connected successfully');
      }

      // Prepare all users
      const allUsers = participantProfiles.map(participant => ({
        id: participant.userId,
        name: participant.nickname || participant.fullname,
        image: participant.profileImageUrl !== 'N/A' 
          ? participant.profileImageUrl 
          : DEFAULT_AVATAR
      }));

      // Upsert users
      try {
        await chatClient.upsertUsers(allUsers);
        console.log('✅ All users upserted successfully');
      } catch (upsertError) {
        console.warn('⚠️ Some users may already exist:', upsertError);
      }

      // Create or access channel
      const channelId = `trip-${tripId}`;
      const allMemberIds = allUsers.map(u => u.id);
      
      let channel;
      try {
        channel = chatClient.channel('messaging', channelId);
        await channel.query();
        
        const currentMembers = Object.keys(channel.state.members || {});
        const missingMembers = allMemberIds.filter(id => !currentMembers.includes(id));
        
        if (missingMembers.length > 0) {
          console.log('Adding missing members:', missingMembers);
          await channel.addMembers(missingMembers);
        }
      } catch (channelError) {
        console.log('🆕 Creating new channel:', channelId);
        
        channel = chatClient.channel('messaging', channelId, {
          name: `${tripData.name} - Group Chat`,
          members: allMemberIds,
          created_by_id: user.id,
          trip_id: tripId,
          trip_name: tripData.name,
        });

        await channel.create();
        console.log('✅ Channel created successfully');
      }

      if (isMountedRef.current) {
        setChatState({
          client: chatClient,
          channel,
          currentUser: user,
          isLoading: false,
          error: null
        });
        retryCountRef.current = 0;
        console.log('✅ Chat initialization complete');
      }
    } catch (error) {
      console.error('❌ Error initializing chat:', error);
      if (isMountedRef.current) {
        setChatState(prev => ({
          ...prev,
          isLoading: false,
          error: (error as Error).message || 'Failed to initialize chat'
        }));
      }
    }
  }, [tripId, getCurrentUser]);

  // Auto-retry logic
  const retryInitialization = useCallback(async () => {
    if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
      console.log('Max retry attempts reached');
      return;
    }

    retryCountRef.current++;
    console.log(`Retrying chat initialization (${retryCountRef.current}/${MAX_RETRY_ATTEMPTS})`);
    
    setTimeout(async () => {
      try {
        const tripData = await fetchTripDetails();
        if (tripData && isMountedRef.current) {
          await initializeChat(tripData.tripData, tripData.participantProfiles);
        }
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }, RECONNECTION_DELAY * retryCountRef.current);
  }, [fetchTripDetails, initializeChat]);

  // Main initialization effect
  useEffect(() => {
    if (!tripId) return;

    const initialize = async () => {
      try {
        const tripData = await fetchTripDetails();
        if (tripData && isMountedRef.current) {
          await initializeChat(tripData.tripData, tripData.participantProfiles);
        }
      } catch (error) {
        console.error('Initial setup failed:', error);
        if (chatState.error && retryCountRef.current < MAX_RETRY_ATTEMPTS) {
          retryInitialization();
        }
      }
    };

    initialize();
  }, [tripId]); // Removed dependencies to prevent loops

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (clientRef.current) {
        clientRef.current.disconnectUser().catch(console.error);
        clientRef.current = null;
      }
    };
  }, []);

  // Event handlers
  const handleBack = useCallback(() => {
    router.push('/findTrips');
  }, [router]);

  const handleRetry = useCallback(async () => {
    retryCountRef.current = 0;
    try {
      const tripData = await fetchTripDetails();
      if (tripData) {
        await initializeChat(tripData.tripData, tripData.participantProfiles);
      }
    } catch (error) {
      console.error('Manual retry failed:', error);
    }
  }, [fetchTripDetails, initializeChat]);

  const handleJoinTrip = useCallback(async (trip: Trip) => {
    try {
      // Implement join trip logic
      console.log("Join trip:", trip.id);
      // const response = await axiosInstance.post(`/trips/${trip.id}/join`);
      // Handle success
    } catch (error) {
      Alert.alert('Error', 'Failed to join trip');
    }
  }, []);
  
  const handleTripPress = useCallback(async (trip: Trip) => {
    try {
      console.log("Trip card pressed");
      
      const userId = await AsyncStorage.getItem('userId');
      console.log("Trip Pressed");
      console.log("Trip ID:", trip.id);
      console.log("Trip Owner ID:", trip.tripOwnerId || trip.tripOwner?.id); // Handle both possible fields
      console.log("Current User ID:", userId);
      
      if (!userId) {
        console.error('No user ID found in storage');
        // Handle case where user is not logged in
        Alert.alert('Error', 'Please log in to continue');
        return;
      }
      
      // Check if user is the trip owner (handle both possible owner ID locations)
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
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  }, [router]);
  
  const handleBookmarkToggle = useCallback(async (trip: Trip) => {
    try {
      // Implement bookmark logic
      console.log("Bookmark toggle:", trip.id);
      // const response = await axiosInstance.post(`/trips/${trip.id}/bookmark`);
      // Handle success
    } catch (error) {
      Alert.alert('Error', 'Failed to update bookmark');
    }
  }, []);
  
  const isTripBookmarked = useCallback((tripId: string) => {
    // Implement bookmark check logic
    return false;
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>กำลังโหลดแชท...</Text>
          {retryCountRef.current > 0 && (
            <Text style={styles.retryText}>
              กำลังลองใหม่... ({retryCountRef.current}/{MAX_RETRY_ATTEMPTS})
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>ไม่สามารถโหลดแชทได้</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>ลองใหม่</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleBack} style={styles.backButtonError}>
              <Text style={styles.backButtonErrorText}>กลับ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render chat interface
  if (!chatState.channel || !chatState.client || !trip) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>เตรียมแชท...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Chat client={chatState.client} theme="messaging light">
        <Channel channel={chatState.channel}>
      
        <Window>
        <CustomChannelHeader 
              participants={participants}
              tripName={trip.name}
              onBack={handleBack}
            />
            
        
          <TripCard
              key={trip.id}
              trip={trip}
              isBookmarked={isTripBookmarked(trip.id)}
              onBookmarkToggle={handleBookmarkToggle}
              onTripPress={handleTripPress}
              onJoinTrip={handleJoinTrip}
            />
       
            
   
          <MessageList Message={ProductionCustomMessage} />
       
              <MessageInput />
          <Thread />
        </Window>
        </Channel>
      </Chat>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonError: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButtonErrorText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
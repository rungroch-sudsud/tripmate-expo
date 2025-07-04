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

// Singleton Stream Chat client to prevent multiple instances
let globalStreamClient: StreamChat | null = null;

const getStreamChatClient = () => {
  if (!globalStreamClient) {
    globalStreamClient = StreamChat.getInstance(requirements.stream_api_key);
  }
  return globalStreamClient;
};

// Custom hooks for better separation of concerns
const useTripData = (tripId: string) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<TripParticipant[]>([]);
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use AbortController to cancel pending requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTripDetails = useCallback(async () => {
    if (!tripId) return null;
    
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setLoading(true);
    setError(null);
    
    try {
      const tripResponse = await axiosInstance.get(`/trips/${tripId}`, { signal });
      const tripData = tripResponse.data.data;
      
      if (!tripData) {
        throw new Error('Trip data not found');
      }
      
      // Check if request was aborted
      if (signal.aborted) return null;
      
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

      // Fetch all participants concurrently with error handling and abort signal
      const participantResults = await Promise.allSettled(
        allParticipantIds.map(async (userId: string) => {
          if (signal.aborted) throw new Error('Aborted');
          const userResponse = await axiosInstance.get(`/users/profile/${userId}`, { signal });
          return userResponse.data?.data;
        })
      );

      // Check if request was aborted after participant fetch
      if (signal.aborted) return null;

      const validParticipants = participantResults
        .filter((result): result is PromiseFulfilledResult<TripParticipant> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      if (validParticipants.length === 0) {
        throw new Error('No valid participants found');
      }
      
      setParticipants(validParticipants);

      // Fetch additional data (non-critical) - only if not aborted
      if (!signal.aborted) {
        try {
          const [travelStylesResponse, servicesResponse] = await Promise.all([
            axiosInstance.get('/travel-styles', { signal }),
            axiosInstance.get('/services', { signal })
          ]);

          if (!signal.aborted) {
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
          }
        } catch (additionalDataError) {
          if (!signal.aborted) {
            console.warn('Failed to fetch additional data:', additionalDataError);
          }
        }
      }

      return { tripData, participantProfiles: validParticipants };
    } catch (err) {
      if (signal.aborted) return null;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load trip details';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [tripId]);

  // Cleanup function to cancel pending requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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

  // Refs for cleanup and state management
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);

  // Memoized values
  const isLoading = useMemo(() => 
    tripLoading || chatState.isLoading, 
    [tripLoading, chatState.isLoading]
  );

  const error = useMemo(() => 
    tripError || chatState.error, 
    [tripError, chatState.error]
  );

  // Chat initialization with retry logic and proper cleanup
// Helper function to check if error is related to permissions
const isPermissionError = (error: any) => {
  return error?.status === 403 || 
         error?.response?.status === 403 || 
         error?.code === 403 ||
         error?.message?.includes('forbidden') ||
         error?.message?.includes('permission');
};

// Fixed initializeChat function
const initializeChat = useCallback(async (tripData: any, participantProfiles: TripParticipant[]) => {
  if (!isMountedRef.current) return;
  if (initializationPromiseRef.current) {
    return initializationPromiseRef.current;
  }

  const initPromise = (async () => {
    try {
      setChatState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const user = await getCurrentUser(participantProfiles);
      const chatClient = getStreamChatClient();

      // Disconnect if necessary (different user)
      if (chatClient.userID && chatClient.userID !== user.id) {
        try { 
          await chatClient.disconnectUser(); 
        } catch (disconnectError) {
          console.warn('Disconnect error:', disconnectError);
        }
      }

      // Connect user if not already connected
      if (chatClient.userID !== user.id) {
        await chatClient.connectUser(user, chatClient.devToken(user.id));
      }

      // Prepare all users for the channel
      const allUsers = participantProfiles.map(participant => ({
        id: participant.userId,
        name: participant.nickname || participant.fullname,
        image: participant.profileImageUrl !== 'N/A' 
          ? participant.profileImageUrl 
          : DEFAULT_AVATAR
      }));

      // Upsert users (create/update user profiles)
      try { 
        await chatClient.upsertUsers(allUsers); 
      } catch (upsertError) {
        console.warn('Upsert users error:', upsertError);
      }

      const channelId = `trip-${tripId}`;
      const allMemberIds = allUsers.map(u => u.id);
      
      // Create channel reference
      let channel = chatClient.channel('messaging', channelId);

      try {
        // First, try to watch the channel (this will tell us if it exists and if we have access)
        await channel.watch();
        
        // If we successfully watched the channel, check if all members are present
        const currentMembers = Object.keys(channel.state.members || {});
        const missingMembers = allMemberIds.filter(id => !currentMembers.includes(id));
        
        if (missingMembers.length > 0) {
          console.log('Adding missing members:', missingMembers);
          try {
            await channel.addMembers(missingMembers);
          } catch (addMembersError) {
            console.warn('Error adding missing members:', addMembersError);
            // Continue anyway - the channel exists and current user has access
          }
        }
        
      } catch (watchError) {
        console.log('Channel watch failed, creating new channel:', watchError);
        
        // Handle permission errors specifically
      // Replace the permission error handling section with this:
if (isPermissionError(watchError)) {
  console.error('Permission denied for channel access:', watchError);
  console.log("Owner Permission Required: ", tripData.tripOwnerId);
  
  try {
    const response = await axiosInstance.get(`/users/profile/${tripData.tripOwnerId}`);
    console.log("Owner Details: ", response.data.data);
    
    // Transform the owner data to match Stream Chat's expected format
    const ownerUserData = {
      id: response.data.data.userId, // Map userId to id
      name: response.data.data.nickname || response.data.data.fullname,
      image: response.data.data.profileImageUrl !== 'N/A' 
        ? response.data.data.profileImageUrl 
        : DEFAULT_AVATAR,
      // Include other relevant fields if needed
      email: response.data.data.email,
      fullname: response.data.data.fullname,
      nickname: response.data.data.nickname
    };
    
    // Disconnect current user first
    try {
      await chatClient.disconnectUser();
    } catch (disconnectError) {
      console.warn('Disconnect error:', disconnectError);
    }
    
    // Connect as trip owner
    await chatClient.connectUser(ownerUserData, chatClient.devToken(tripData.tripOwnerId));
    
    // Get channel and add missing members
    let channel = chatClient.channel('messaging', channelId);
    await channel.watch(); // Watch first to get current state
    
    const currentMembers = Object.keys(channel.state.members || {});
    const missingMembers = allMemberIds.filter(id => !currentMembers.includes(id));
    
    if (missingMembers.length > 0) {
      console.log('Adding missing members as owner:', missingMembers);
      await channel.addMembers(missingMembers);
    }
    
    // Disconnect owner and reconnect as original user
    await chatClient.disconnectUser();
    await chatClient.connectUser(user, chatClient.devToken(user.id));
    
    // Get the channel again as the original user
    channel = chatClient.channel('messaging', channelId);
    await channel.watch();
    
    console.log('Successfully added members and reconnected as original user');
    
  } catch (ownerError) {
    console.error('Error handling owner permission:', ownerError);
    throw new Error('Failed to resolve permission issue. Please contact the trip organizer.');
  }
} else {
  // Handle other types of watch errors
  console.log('Channel watch failed, creating new channel:', watchError);
  // ... rest of your existing channel creation logic
}
        
        // Channel doesn't exist - create it
        channel = chatClient.channel('messaging', channelId, {
          name: `${tripData.name} - Group Chat`,
          members: allMemberIds,
          created_by_id: user.id,
          trip_id: tripId,
          trip_name: tripData.name,
        });
        
        try {
          await channel.create();
        } catch (createError) {
          console.error('Error creating channel:', createError);
          
          if (isPermissionError(createError)) {
            throw new Error('Permission denied when creating chat channel.');
          }
          
          // If creation fails, try to get the channel again (might exist now)
          channel = chatClient.channel('messaging', channelId);
          try {
            await channel.watch();
          } catch (secondWatchError) {
            throw new Error(`Failed to create or access channel: ${createError.message}`);
          }
        }
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
      }
      
    } catch (error) {
      console.error('Chat initialization error:', error);
      if (isMountedRef.current) {
        setChatState(prev => ({
          ...prev,
          isLoading: false,
          error: (error as Error).message || 'Failed to initialize chat'
        }));
      }
    } finally {
      initializationPromiseRef.current = null;
    }
  })();
  
  initializationPromiseRef.current = initPromise;
  return initPromise;
}, [tripId, getCurrentUser]);

  // Auto-retry logic with exponential backoff
  const retryInitialization = useCallback(async () => {
    if (retryCountRef.current >= MAX_RETRY_ATTEMPTS || !isMountedRef.current) {
      console.log('Max retry attempts reached or component unmounted');
      return;
    }

    retryCountRef.current++;
    console.log(`Retrying chat initialization (${retryCountRef.current}/${MAX_RETRY_ATTEMPTS})`);
    
    const delay = RECONNECTION_DELAY * Math.pow(2, retryCountRef.current - 1); // Exponential backoff
    
    setTimeout(async () => {
      if (!isMountedRef.current) return;
      
      try {
        const tripData = await fetchTripDetails();
        if (tripData && isMountedRef.current) {
          await initializeChat(tripData.tripData, tripData.participantProfiles);
        }
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }, delay);
  }, [fetchTripDetails, initializeChat]);

  // Main initialization effect with proper dependency management
  useEffect(() => {
    if (!tripId) return;

    let isEffectActive = true;

    const initialize = async () => {
      try {
        const tripData = await fetchTripDetails();
        if (tripData && isEffectActive && isMountedRef.current) {
          await initializeChat(tripData.tripData, tripData.participantProfiles);
        }
      } catch (error) {
        console.error('Initial setup failed:', error);
        if (isEffectActive && isMountedRef.current && chatState.error && retryCountRef.current < MAX_RETRY_ATTEMPTS) {
          retryInitialization();
        }
      }
    };

    initialize();

    return () => {
      isEffectActive = false;
    };
  }, [tripId]); // Keep minimal dependencies

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Cleanup effect with proper Stream Chat disconnect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Cancel any pending initialization
      if (initializationPromiseRef.current) {
        initializationPromiseRef.current = null;
      }
      
      // Note: We don't disconnect the global client here as it might be used by other components
      // The global client will be cleaned up when the app closes
    };
  }, []);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleBack = useCallback(() => {
    router.push('/findTrips');
  }, [router]);

  const handleRetry = useCallback(async () => {
    retryCountRef.current = 0;
    initializationPromiseRef.current = null;
    
    try {
      const tripData = await fetchTripDetails();
      if (tripData && isMountedRef.current) {
        await initializeChat(tripData.tripData, tripData.participantProfiles);
      }
    } catch (error) {
      console.error('Manual retry failed:', error);
    }
  }, [fetchTripDetails, initializeChat]);

  const handleJoinTrip = useCallback(async (trip: Trip) => {
    try {
      console.log("Join trip:", trip.id);
      // Implement join trip logic
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
      console.log("Trip Pressed - ID:", trip.id, "Owner:", trip.tripOwnerId, "User:", userId);
      
      if (!userId) {
        console.error('No user ID found in storage');
        Alert.alert('Error', 'Please log in to continue');
        return;
      }
      
      const ownerId = trip.tripOwnerId;
      
      if (userId === ownerId) {
        console.log("Edit Trip - User is owner");
        router.push(`/EditTrip?tripId=${trip.id}`);
      } else {
        console.log("View Trip - User is not owner");
      }
      
    } catch (error) {
      console.error('Error handling trip press:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  }, [router]);
  
  const handleBookmarkToggle = useCallback(async (trip: Trip) => {
    try {
      console.log("Bookmark toggle:", trip.id);
      // Implement bookmark logic
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

  // Memoize the trip card to prevent unnecessary re-renders
  const memoizedTripCard = useMemo(() => {
    if (!trip) return null;
    
    return (
      <TripCard
        key={trip.id}
        trip={trip}
        isBookmarked={isTripBookmarked(trip.id)}
        onBookmarkToggle={handleBookmarkToggle}
        onTripPress={handleTripPress}
        onJoinTrip={handleJoinTrip}
      />
    );
  }, [trip, isTripBookmarked, handleBookmarkToggle, handleTripPress, handleJoinTrip]);

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
            
            {memoizedTripCard}
            
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

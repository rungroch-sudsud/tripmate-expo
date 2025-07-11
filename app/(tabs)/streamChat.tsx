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
import TripCard from '../../components/TripCard';
import type { Channel as StreamChannel } from 'stream-chat';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  BackHandler 
} from 'react-native';
import { axiosInstance } from '../../lib/axios';
import { requirements } from '../../requirement';
import CustomChannelHeader from '../../components/customChannelHeader'
import ProductionCustomMessage from '../../components/customMessage';
import 'stream-chat-react/css/v2/index.css'
import styles from '../../css/stream_chat_styles'
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

const DEFAULT_AVATAR = 'https://via.placeholder.com/40x40/cccccc/666666?text=👤';

// Singleton Stream Chat client
let globalStreamClient: StreamChat | null = null;
const getStreamChatClient = () => {
  if (!globalStreamClient) {
    globalStreamClient = StreamChat.getInstance(requirements.stream_api_key);
  }
  return globalStreamClient;
};

const isPermissionError = (error: any) => {
  return error?.status === 403 || 
         error?.response?.status === 403 || 
         error?.code === 403 ||
         error?.message?.includes('forbidden') ||
         error?.message?.includes('permission');
};

export default function TripGroupChat() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<TripParticipant[]>([]);
  const [chatState, setChatState] = useState<ChatState>({
    client: null,
    channel: null,
    currentUser: null,
    isLoading: false,
    error: null
  });

  const isMountedRef = useRef(true);
  const isLoading = trip === null || chatState.isLoading;

  // Fetch trip and participant data
  const fetchTripData = useCallback(async () => {
    try {
      const [tripResponse, userId] = await Promise.all([
        axiosInstance.get(`/trips/${tripId}`),
        AsyncStorage.getItem('userId')
      ]);

      if (!userId) throw new Error('User not logged in');
      
      const tripData = tripResponse.data.data;
      if (!tripData) throw new Error('Trip not found');

      setTrip(tripData);

      // Get all participant IDs including owner
      const participantIds = Array.from(new Set([
        tripData.tripOwnerId,
        ...(tripData.participants || []).map((p: any) => 
          typeof p === 'string' ? p : p?.userId
        ).filter(Boolean)
      ]));

      // Fetch participant profiles
      const participantResults = await Promise.allSettled(
        participantIds.map(async (id: string) => {
          const response = await axiosInstance.get(`/users/profile/${id}`);
          return response.data?.data;
        })
      );

      const validParticipants = participantResults
        .filter((result): result is PromiseFulfilledResult<TripParticipant> => 
          result.status === 'fulfilled' && result.value
        )
        .map(result => result.value);

      setParticipants(validParticipants);
      return { tripData, participantProfiles: validParticipants, currentUserId: userId };
    } catch (error) {
      throw error;
    }
  }, [tripId]);

  // Initialize chat - much simpler now
const initializeChat = useCallback(async (tripData: Trip, participantProfiles: TripParticipant[], currentUserId: string) => {
  if (!isMountedRef.current) return;

  try {
    setChatState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Find current user
    const userProfile = participantProfiles.find(p => p.userId === currentUserId);
    if (!userProfile) throw new Error('You are not a participant in this trip');

    const currentUser = {
      id: userProfile.userId,
      name: userProfile.nickname || userProfile.fullname,
      image: userProfile.profileImageUrl !== 'N/A' ? userProfile.profileImageUrl : DEFAULT_AVATAR
    };

    const chatClient = getStreamChatClient();

    // Connect user if not already connected
    if (chatClient.userID !== currentUser.id) {
      if (chatClient.userID) {
        await chatClient.disconnectUser();
      }
      await chatClient.connectUser(currentUser, chatClient.devToken(currentUser.id));
    }

    // Prepare all users for the channel
    const allUsers = participantProfiles.map(participant => ({
      id: participant.userId,
      name: participant.nickname || participant.fullname,
      image: participant.profileImageUrl !== 'N/A' 
        ? participant.profileImageUrl 
        : DEFAULT_AVATAR
    }));

    const channelId = `trip-${tripId}`;
    const allMemberIds = allUsers.map(u => u.id);
    let channel = chatClient.channel('messaging', channelId);

    try {
      await channel.watch();
      console.log('Successfully joined existing channel');      
    } catch (watchError) {
      console.log('Channel watch failed:', watchError);
      
      if (isPermissionError(watchError)) {
        console.error('Permission denied for channel access:', watchError);
        console.log("Owner Permission Required: ", tripData.tripOwnerId);
        
        try {
          // Get owner details
          const ownerResponse = await axiosInstance.get(`/users/profile/${tripData.tripOwnerId}`);
          const ownerData = ownerResponse.data.data;
          console.log("Owner Details: ", ownerData);
          
          const ownerUser = {
            id: ownerData.userId,
            name: ownerData.nickname || ownerData.fullname,
            image: ownerData.profileImageUrl !== 'N/A' ? ownerData.profileImageUrl : DEFAULT_AVATAR,
            email: ownerData.email,
            fullname: ownerData.fullname,
            nickname: ownerData.nickname
          };
          
          // Connect as owner, handle channel, then reconnect as user
          await chatClient.disconnectUser();
          await chatClient.connectUser(ownerUser, chatClient.devToken(ownerData.userId));
          
          // Get channel and add missing members
          let ownerChannel = chatClient.channel('messaging', channelId);
          
          try {
            await ownerChannel.watch();
            
            // Add missing members if any
            const currentMembers = Object.keys(ownerChannel.state.members || {});
            const missingMembers = allMemberIds.filter(id => !currentMembers.includes(id));
            
            if (missingMembers.length > 0) {
              console.log('Adding missing members as owner:', missingMembers);
              await ownerChannel.addMembers(missingMembers);
            }
            
          } catch (ownerWatchError) {
            // If watching fails, try to create the channel
            console.log('Owner watch failed, creating channel:', ownerWatchError);
          }
          
          // Reconnect as original user
          await chatClient.disconnectUser();
          await chatClient.connectUser(currentUser, chatClient.devToken(currentUser.id));
          
          // Get the channel again as the original user
          channel = chatClient.channel('messaging', channelId);
          await channel.watch();
          
          console.log('Successfully handled permission issue and reconnected as original user');
          
        } catch (ownerError) {
          console.error('Error handling owner permission:', ownerError);
          throw new Error('Failed to join chat. Please contact the trip organizer.');
        }
      } else {
        // Handle other types of watch errors - channel should exist since it's created during trip creation
        console.log('Non-permission error, channel should exist:', watchError);
        throw new Error('Channel not found or inaccessible. Please contact the trip organizer.');
      }
    }

    if (isMountedRef.current) {
      setChatState({
        client: chatClient,
        channel,
        currentUser,
        isLoading: false,
        error: null
      });
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
  }
}, [tripId]);

  // Main initialization
  useEffect(() => {
    if (!tripId) return;

    const initialize = async () => {
      try {
        const { tripData, participantProfiles, currentUserId } = await fetchTripData();
        await initializeChat(tripData, participantProfiles, currentUserId);
      } catch (error) {
        if (isMountedRef.current) {
          setChatState(prev => ({
            ...prev,
            isLoading: false,
            error: (error as Error).message || 'Failed to load chat'
          }));
        }
      }
    };

    initialize();
  }, [tripId, fetchTripData, initializeChat]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.push('/findTrips');
      return true;
    });
    return () => backHandler.remove();
  }, [router]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleBack = useCallback(() => {
    router.push('/findTrips');
  }, [router]);

  const handleRetry = useCallback(async () => {
    try {
      const { tripData, participantProfiles, currentUserId } = await fetchTripData();
      await initializeChat(tripData, participantProfiles, currentUserId);
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }, [fetchTripData, initializeChat]);

  // Simple event handlers
  const handleJoinTrip = useCallback(async (trip: Trip) => {
    try {
      // Implement join logic
      console.log("Join trip:", trip.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to join trip');
    }
  }, []);

  const handleTripPress = useCallback(async (trip: Trip) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'Please log in to continue');
        return;
      }
      
      if (userId === trip.tripOwnerId) {
        router.push(`/EditTrip?tripId=${trip.id}`);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  }, [router]);

  const handleBookmarkToggle = useCallback(async (trip: Trip) => {
    console.log("Bookmark toggle:", trip.id);
  }, []);

  const isTripBookmarked = useCallback(() => false, []);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>กำลังโหลดแชท...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (chatState.error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>ไม่สามารถโหลดแชทได้</Text>
          <Text style={styles.errorText}>{chatState.error}</Text>
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

  // Chat interface
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
              trip={trip}
              isBookmarked={isTripBookmarked()}
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


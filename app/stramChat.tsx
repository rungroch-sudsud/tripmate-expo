import { StreamChat } from 'stream-chat';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Channel,
  Chat,
  Window,
  MessageInput,
  MessageList,
  Thread,
  TypingContextValue,
  TypingIndicator,
  LoadingIndicator,
} from 'stream-chat-react';
import type { Channel as StreamChannel } from 'stream-chat';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { axiosInstance } from '../lib/axios';
import 'stream-chat-react/dist/css/v2/index.css';
import {requirements} from './requirement'

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
}





const MAX_DISPLAYED_AVATARS = 3;
const DEFAULT_AVATAR = 'https://via.placeholder.com/40x40/cccccc/666666?text=👤';

// Custom Channel Header Component
const CustomChannelHeader: React.FC<{ 
  participants: TripParticipant[], 
  tripName: string,
  onBack: () => void 
}> = React.memo(({ participants, tripName, onBack }) => {
  const displayParticipants = useMemo(() => 
    participants.slice(0, MAX_DISPLAYED_AVATARS), 
    [participants]
  );
  const remainingCount = Math.max(0, participants.length - MAX_DISPLAYED_AVATARS);

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      
      <View style={styles.participantsContainer}>
        <View style={styles.avatarsContainer}>
          {displayParticipants.map((participant, index) => (
            <View 
              key={participant.userId} 
              style={[styles.avatarWrapper, { zIndex: MAX_DISPLAYED_AVATARS - index }]}
            >
              <Image
                source={{ 
                  uri: participant.profileImageUrl !== 'N/A' 
                    ? participant.profileImageUrl 
                    : DEFAULT_AVATAR
                }}
                style={styles.participantAvatar}
                defaultSource={{ uri: DEFAULT_AVATAR }}
              />
            </View>
          ))}
          {remainingCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>+{remainingCount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.groupInfo}>
          <Text style={styles.participantCount}>
            {participants.length} คน
          </Text>
          <Text style={styles.tripHint} numberOfLines={1}>
            {tripName}
          </Text>
        </View>
      </View>
    </View>
  );
});

// Custom Message Component with improved error handling
const CustomMessage: React.FC<{
  message: any;
  participants: TripParticipant[];
  currentUser: any;
}> = React.memo(({ message, participants, currentUser }) => {
  // Validation
  if (!message?.user?.id || !message.text) {
    return null;
  }

  const user = message.user;
  const participantData = useMemo(() => 
    participants.find(p => p.userId === user.id), 
    [participants, user.id]
  );
  
  const displayName = useMemo(() => {
    if (participantData) {
      return participantData.nickname || participantData.fullname;
    }
    return user.name || user.id || 'Unknown User';
  }, [participantData, user]);
  
  const displayImage = useMemo(() => {
    if (participantData?.profileImageUrl && participantData.profileImageUrl !== 'N/A') {
      return participantData.profileImageUrl;
    }
    return user.image || DEFAULT_AVATAR;
  }, [participantData, user.image]);
  
  const isOwnMessage = user.id === currentUser?.id;
  
  const formatTime = useCallback((timestamp: string | Date) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }, []);
  
  return (
    <View style={[
      styles.customMessage,
      isOwnMessage && styles.ownMessage
    ]}>
      {!isOwnMessage && (
        <Image
          source={{ uri: displayImage }}
          style={styles.messageAvatar}
          defaultSource={{ uri: DEFAULT_AVATAR }}
          onError={() => console.log('Failed to load avatar:', displayImage)}
        />
      )}
      <View style={[
        styles.messageContent,
        isOwnMessage && styles.ownMessageContent
      ]}>
        {!isOwnMessage && (
          <View style={styles.messageHeader}>
            <Text style={styles.senderName}>{displayName}</Text>
            <Text style={styles.messageTime}>
              {formatTime(message.created_at)}
            </Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage && styles.ownMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage && styles.ownMessageText
          ]}>
            {message.text}
          </Text>
        </View>
        {isOwnMessage && (
          <Text style={styles.ownMessageTime}>
            {formatTime(message.created_at)}
          </Text>
        )}
      </View>
    </View>
  );
});

export default function TripGroupChat() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tripId = params.tripId as string;


  // State
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [participants, setParticipants] = useState<TripParticipant[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [showReactions, setShowReactions] = useState(false);
const [messageReactions, setMessageReactions] = useState({});
  // Refs for cleanup
  const isMountedRef = useRef(true);
  const clientRef = useRef<StreamChat | null>(null);

  // Fetch trip details and participants with better error handling
  const fetchTripDetails = useCallback(async () => {
    try {
      const tripResponse = await axiosInstance.get(`/trips/${tripId}`);
      const tripData = tripResponse.data.data;
      
      if (!tripData) {
        throw new Error('Trip data not found');
      }
      
      setTrip(tripData);

      // Process participant IDs
      const participantIds = tripData.participants
        ?.map((participant: any) => {
          if (typeof participant === 'string') return participant;
          if (participant?.userId) return participant.userId;
          return null;
        })
        .filter(Boolean) || [];

      const allParticipantIds = [
        tripData.tripOwnerId,
        ...participantIds.filter((id: string) => id !== tripData.tripOwnerId)
      ];

      // Batch fetch participant profiles with improved error handling
      const participantPromises = allParticipantIds.map(async (userId) => {
        try {
          const userResponse = await axiosInstance.get(`/users/profile/${userId}`);
          return userResponse.data?.data || null;
        } catch (error) {
          console.warn(`Failed to fetch user ${userId}:`, error);
          return null;
        }
      });

      const participantResults = await Promise.allSettled(participantPromises);
      const validParticipants = participantResults
        .filter((result): result is PromisedFulfilledResult<TripParticipant> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      if (validParticipants.length === 0) {
        throw new Error('No valid participants found');
      }
      
      setParticipants(validParticipants);
      return { tripData, participantProfiles: validParticipants };
    } catch (error) {
      console.error('Error fetching trip details:', error);
      throw new Error(`Failed to load trip details: ${error.message}`);
    }
  }, [tripId]);

  // Get current user from AsyncStorage
  const getCurrentUser = useCallback(async (participantProfiles: TripParticipant[]) => {
    try {
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
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }, []);

  // Initialize chat with better error handling and cleanup
  useEffect(() => {
    if (!tripId) return;

    let chatClient: StreamChat | null = null;

    async function initializeChat() {
      try {
        setLoading(true);
        setError(null);
        
        const tripData = await fetchTripDetails();
        if (!isMountedRef.current) return;

        const user = await getCurrentUser(tripData.participantProfiles);
        if (!isMountedRef.current) return;

        console.log('🔵 Initializing chat for user:', user.id);
        setCurrentUser(user);

        // Initialize Stream Chat
        chatClient = StreamChat.getInstance(requirements.stream_api_key);
        clientRef.current = chatClient;
        
        // Disconnect any existing connection
        if (chatClient.userID && chatClient.userID !== user.id) {
          console.log('🔄 Disconnecting previous user:', chatClient.userID);
          await chatClient.disconnectUser();
        }

        // Connect user if not already connected
        if (chatClient.userID !== user.id) {
          console.log('🔵 Connecting user to Stream Chat:', user.id);
          await chatClient.connectUser(user, chatClient.devToken(user.id));
          console.log('✅ User connected successfully');
        }

        // Create user objects for all participants
        const allUsers = tripData.participantProfiles.map(participant => ({
          id: participant.userId,
          name: participant.nickname || participant.fullname,
          image: participant.profileImageUrl !== 'N/A' 
            ? participant.profileImageUrl 
            : DEFAULT_AVATAR
        }));

        console.log('👥 Upserting users:', allUsers.length);
        
        // Upsert all users
        try {
          await chatClient.upsertUsers(allUsers);
          console.log('✅ All users upserted successfully');
        } catch (upsertError) {
          console.warn('⚠️ Some users may already exist:', upsertError);
        }

        const allMemberIds = allUsers.map(u => u.id);
        const channelId = `trip-${tripId}`;
        
        // Handle channel creation/access
        let newChannel;
        try {
          console.log('🔍 Accessing channel:', channelId);
          newChannel = chatClient.channel('messaging', channelId);
          
          const channelState = await newChannel.query();
          console.log('✅ Channel accessed, members:', Object.keys(channelState.members).length);
          
          const currentMembers = Object.keys(newChannel.state.members || {});
          const missingMembers = allMemberIds.filter(id => !currentMembers.includes(id));
          
          if (missingMembers.length > 0) {
            console.log('➕ Adding missing members:', missingMembers);
            await newChannel.addMembers(missingMembers);
          }
          
        } catch (channelError) {
          console.log('🆕 Creating new channel:', channelId);
          
          newChannel = chatClient.channel('messaging', channelId, {
            name: `${tripData.tripData.name} - Group Chat`,
            members: allMemberIds,
            created_by_id: user.id,
            trip_id: tripId,
            trip_name: tripData.tripData.name,
          });

          await newChannel.create();
          console.log('✅ Channel created successfully');
        }

        if (isMountedRef.current) {
          setChannel(newChannel);
          setClient(chatClient);
          console.log('✅ Chat initialization complete');
        }
      } catch (error) {
        console.error('❌ Error initializing chat:', error);
        if (isMountedRef.current) {
          setError(error.message || 'Failed to initialize chat');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }

    initializeChat();

    return () => {
      isMountedRef.current = false;
      if (chatClient && chatClient === clientRef.current) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [tripId, fetchTripDetails, getCurrentUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (clientRef.current) {
        clientRef.current.disconnectUser().catch(console.error);
      }
    };
  }, []);

  const handleBack = useCallback(() => {
    router.push('/channelList')
  }, [router]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    // Re-trigger the useEffect by updating a dependency
    window.location.reload?.() || router.replace(router.pathname);
  }, [router]);

  // Memoized message component
  const MessageComponent = useMemo(() => {
    const Component = (props) => {
      if (!props.message) {
        return <View style={{ height: 1 }} />;
      }
      
      return (
        <CustomMessage
          message={props.message}
          participants={participants}
          currentUser={currentUser}
        />
      );
    };
    
    // Helpful for debugging
    Component.displayName = 'MessageComponent';
    
    return Component;
  }, [participants, currentUser]);

  // Error handling with better UX
  const showErrorAlert = useCallback((errorMessage: string) => {
    Alert.alert(
      'เกิดข้อผิดพลาด',
      errorMessage,
      [
        { text: 'ลองใหม่', onPress: handleRetry },
        { text: 'กลับ', onPress: handleBack, style: 'cancel' }
      ]
    );
  }, [handleRetry, handleBack]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator />
        <Text style={styles.loadingText}>กำลังโหลดแชท...</Text>
      </View>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!channel || !client || !trip) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>เตรียมแชท...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Chat client={client} theme="messaging light">
        <Channel channel={channel}>
          <Window>
            <CustomChannelHeader 
              participants={participants}
              tripName={trip.name}
              onBack={handleBack}
            />

            <MessageList 
            />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </View>
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
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
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
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonErrorText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarsContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  avatarWrapper: {
    marginLeft: -8,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  participantCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tripHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  // Message styles
  customMessage: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 2,
    alignItems: 'flex-end',
  },
  ownMessage: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
    maxWidth: '75%',
  },
  ownMessageContent: {
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginLeft: 8,
  },
  messageBubble: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  ownMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 16,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  ownMessageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});
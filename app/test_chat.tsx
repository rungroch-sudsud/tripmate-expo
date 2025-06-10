import { StreamChat } from 'stream-chat';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Channel,
  Chat,
  Window,
  MessageInput,
  MessageList,
  Thread,
  LoadingIndicator,
} from 'stream-chat-react';
import type { Channel as StreamChannel } from 'stream-chat';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { axiosInstance } from '../lib/axios';
import 'stream-chat-react/dist/css/v2/index.css';

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

// Custom Channel Header Component
const CustomChannelHeader: React.FC<{ 
  participants: TripParticipant[], 
  tripName: string,
  onBack: () => void 
}> = React.memo(({ participants, tripName, onBack }) => {
  const displayParticipants = participants.slice(0, 3);
  const remainingCount = Math.max(0, participants.length - 3);

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
              style={[styles.avatarWrapper, { zIndex: 3 - index }]}
            >
              <Image
                source={{ 
                  uri: participant.profileImageUrl !== 'N/A' 
                    ? participant.profileImageUrl 
                    : 'https://via.placeholder.com/40x40/cccccc/666666?text=👤'
                }}
                style={styles.participantAvatar}
                defaultSource={{ uri: 'https://via.placeholder.com/40x40/cccccc/666666?text=👤' }}
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



// Custom Message Component - Fixed version
const CustomMessage: React.FC<{
  message: any;
  participants: TripParticipant[];
  currentUser: any;
}> = React.memo(({ message, participants, currentUser }) => {
  // Early return if message is invalid
  if (!message || !message.user || !message.text) {
    console.log('Invalid message data:', message);
    return null;
  }

  const user = message.user;
  const participantData = participants.find(p => p.userId === user.id);
  
  const displayName = participantData 
    ? (participantData.nickname || participantData.fullname)
    : (user.name || user.id || 'Unknown User');
  
  const displayImage = participantData 
    ? (participantData.profileImageUrl !== 'N/A' ? participantData.profileImageUrl : null)
    : user.image;
  
  const finalImage = displayImage || 'https://via.placeholder.com/32x32/cccccc/666666?text=👤';
  const isOwnMessage = user.id === currentUser?.id;
  
  const formatTime = (timestamp: string | Date) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };
  
  return (
    <View style={[
      styles.customMessage,
      isOwnMessage && styles.ownMessage
    ]}>
      {!isOwnMessage && (
        <Image
          source={{ uri: finalImage }}
          style={styles.messageAvatar}
          defaultSource={{ uri: 'https://via.placeholder.com/32x32/cccccc/666666?text=👤' }}
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

  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [participants, setParticipants] = useState<TripParticipant[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trip details and participants
  const fetchTripDetails = useCallback(async () => {
    try {
      const tripResponse = await axiosInstance.get(`/trips/${tripId}`);
      const tripData = tripResponse.data.data;
      setTrip(tripData);

      const participantIds = tripData.participants
        .map((participant: any) => {
          if (typeof participant === 'string') {
            return participant;
          } else if (participant?.userId) {
            return participant.userId;
          }
          return null;
        })
        .filter(Boolean);

      const allParticipantIds = [
        tripData.tripOwnerId,
        ...participantIds.filter((id: string) => id !== tripData.tripOwnerId)
      ];

      // Batch fetch participant profiles with error handling
      const participantPromises = allParticipantIds.map(async (userId) => {
        try {
          const userResponse = await axiosInstance.get(`/users/profile/${userId}`);
          return userResponse.data.data;
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          return null;
        }
      });

      const participantResults = await Promise.all(participantPromises);
      const validParticipants = participantResults.filter(Boolean) as TripParticipant[];
      
      setParticipants(validParticipants);
      return { tripData, participantProfiles: validParticipants };
    } catch (error) {
      console.error('Error fetching trip details:', error);
      throw error;
    }
  }, [tripId]);

  // Get current user from AsyncStorage
  const getCurrentUser = useCallback(async (participantProfiles: TripParticipant[]) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('No userId found in AsyncStorage');
      }

      const userProfile = participantProfiles.find(p => p.userId === userId);
      
      if (!userProfile) {
        throw new Error('User profile not found in participants');
      }

      return {
        id: userProfile.userId,
        name: userProfile.nickname || userProfile.fullname,
        image: userProfile.profileImageUrl !== 'N/A' 
          ? userProfile.profileImageUrl 
          : 'https://via.placeholder.com/40x40/cccccc/666666?text=👤'
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }, []);

  // Initialize chat
// Improved Initialize chat with better error handling and debugging
useEffect(() => {
    let isMounted = true;
  
    async function initializeChat() {
      try {
        setLoading(true);
        setError(null);
        
        const tripData = await fetchTripDetails();
        if (!tripData || !isMounted) return;
  
        const user = await getCurrentUser(tripData.participantProfiles);
        if (!user || !isMounted) return;
  
        console.log('🔵 Current user:', user);
        setCurrentUser(user);
  
        // Initialize Stream Chat - MAKE SURE THIS MATCHES YOUR DEBUGGER
        const chatClient = StreamChat.getInstance('wq8d7u6t5xaj');
        
        // Disconnect any existing connection
        if (chatClient.userID && chatClient.userID !== user.id) {
          console.log('🔄 Disconnecting previous user:', chatClient.userID);
          await chatClient.disconnectUser();
        }
  
        // Connect user if not already connected
        if (chatClient.userID !== user.id) {
          console.log('🔵 Connecting user to Stream Chat:', user);
          await chatClient.connectUser(user, chatClient.devToken(user.id));
          console.log('✅ User connected successfully');
        }
  
        // Get ALL member IDs upfront
        const allMemberIds = tripData.participantProfiles.map(p => p.userId);
        console.log('👥 All trip members:', allMemberIds);
  
        // Create channel ID
        const channelId = `trip-${tripId}`;
        console.log('📺 Channel ID:', channelId);
        
        // Try to get existing channel first
        let newChannel;
        try {
          // Try to get existing channel
          console.log('🔍 Looking for existing channel...');
          newChannel = chatClient.channel('messaging', channelId);
          
          // Query channel state first to see if it exists
          const channelState = await newChannel.query();
          console.log('✅ Found existing channel with', Object.keys(channelState.members).length, 'members');
          
          // Check if current user is a member
          const currentMembers = Object.keys(newChannel.state.members);
          console.log('👥 Current channel members:', currentMembers);
          
          if (!currentMembers.includes(user.id)) {
            console.log('➕ Adding current user to existing channel');
            await newChannel.addMembers([user.id]);
          }
          
          // Add any missing members
          const missingMembers = allMemberIds.filter(id => !currentMembers.includes(id));
          if (missingMembers.length > 0) {
            console.log('➕ Adding missing members:', missingMembers);
            await newChannel.addMembers(missingMembers);
          }
          
        } catch (error) {
          console.log('❌ Channel does not exist or error accessing:', error.message);
          console.log('🆕 Creating new channel...');
          
          // Create new channel with ALL members at once
          newChannel = chatClient.channel('messaging', channelId, {
            name: `${tripData.tripData.name} - Group Chat`,
            members: allMemberIds, // Add ALL members immediately
            created_by_id: user.id,
            trip_id: tripId,
            trip_name: tripData.tripData.name
          });
  
          console.log('🆕 Creating channel with members:', allMemberIds);
          await newChannel.create();
          console.log('✅ Channel created successfully');
        }
  
        // Final verification
        console.log('🔍 Final channel state:');
        console.log('- Channel ID:', newChannel.id);
        console.log('- Members:', Object.keys(newChannel.state.members));
        console.log('- Messages:', newChannel.state.messages.length);
  
        if (isMounted) {
          setChannel(newChannel);
          setClient(chatClient);
          console.log('✅ Chat initialization complete');
        }
      } catch (error) {
        console.error('❌ Error initializing chat:', error);
        if (isMounted) {
          setError(`Failed to initialize chat: ${error.message}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
  
    if (tripId) {
      initializeChat();
    }
  
    return () => {
      isMounted = false;
    };
  }, [tripId, fetchTripDetails, getCurrentUser]);
  

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [client]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    // The useEffect will handle the retry
  }, []);

  const DebugMessages = () => {
    if (!channel) return null;
    
    return (
      <View style={{ backgroundColor: '#f0f0f0', padding: 10 }}>
        <Text>🔍 Debug Info:</Text>
        <Text>Channel: {channel.id}</Text>
        <Text>Messages: {channel.state.messages.length}</Text>
        <Text>Members: {Object.keys(channel.state.members).length}</Text>
        <Text>Current User: {currentUser?.id}</Text>
        {channel.state.messages.slice(-3).map((msg, idx) => (
          <Text key={idx} style={{ fontSize: 10 }}>
            {msg.user?.id}: {msg.text}
          </Text>
        ))}
      </View>
    );
  };
  // Custom message renderer with proper error handling
  const MessageComponent = useCallback((props: any) => {
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
  }, [participants, currentUser]);

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
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>ลองใหม่</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBack} style={styles.backButtonError}>
          <Text style={styles.backButtonText}>กลับ</Text>
        </TouchableOpacity>
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
            <DebugMessages />

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
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonError: {
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  // Enhanced message styles
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
import React from 'react';
import {
  useMessageContext,
  useChatContext
} from 'stream-chat-react';

import { useRouter, useLocalSearchParams } from 'expo-router';

import { View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import { axiosInstance } from '../lib/axios';

const DEFAULT_AVATAR = 'https://via.placeholder.com/40x40/cccccc/666666?text=👤';

const ProductionCustomMessage: React.FC = () => {
  const { message } = useMessageContext();
  const { client } = useChatContext();
  const router = useRouter();
  const params = useLocalSearchParams();
  const tripId = params.tripId as string;
  
  // Fix: Add proper typing and null checks
  const handleUserClick = async () => {
    if (!message?.user?.id || !tripId) return;
    
    console.log('Target Users:', message.user.id);
    console.log("Current Trip: ", tripId);
    console.log(client?.user?.id);
    try {
      const response = await axiosInstance.get(`/users/review/eligible/${message.user.id}`, {
        params: { tripId }
      });
      
      console.log(response.data);
      
      // If status is 200, navigate to review page
      if (response.status === 200) {
        router.push(`/Review?id=${message.user.id}&tripId=${tripId}`);
      }
    } catch (error) {
      // Handle errors (404, 500, etc.) - just return normally
      console.error('Error checking review eligibility:', error.response?.status, error.response?.data);
      // The function will return normally without navigation
    }
  };

  // Fix: Add proper typing for timestamp parameter
  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Fix: Add null checks
  if (!message || !client?.user) {
    return <View style={{ height: 1 }} />;
  }

  const isOnline = message.user?.online;
  const isCurrentUser = message.user?.id === client.user?.id;

  if (isCurrentUser) {
    // Current user message - Right side
    return (
      <View style={styles.currentUserMessageContainer}>
        <View style={styles.currentUserMessageBubble}>
          <Text style={styles.currentUserMessageText}>
            {message.text}
          </Text>
          <Text style={styles.currentUserMessageTime}>
            {formatTime(message.created_at)}
          </Text>
        </View>
      </View>
    );
  }

  // Other users' messages - Left side
  return (
    <View style={styles.otherUserMessageContainer}>
      {/* Avatar Section */}
      <TouchableOpacity 
        style={styles.avatarContainer}
        onPress={handleUserClick}
      >
        <View style={styles.avatarImageContainer}>
          <Image 
            source={{ 
              uri: message.user?.image || DEFAULT_AVATAR
            }}
            style={styles.messageAvatar}
            defaultSource={{ uri: DEFAULT_AVATAR }}
          />
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>
      </TouchableOpacity>

      {/* Message Content */}
      <View style={styles.otherUserMessageBubble}>
        {/* Header */}
        <View style={styles.messageHeader}>
          <TouchableOpacity onPress={handleUserClick}>
            <Text style={styles.userName}>
              {message.user?.name || 'Unknown User'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.messageTime}>
            {formatTime(message.created_at)}
          </Text>
        </View>

        {/* Message Text */}
        <Text style={styles.otherUserMessageText}>
          {message.text}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  otherUserMessageContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
    maxWidth: '70%',
    gap: 10,
  },
  avatarContainer: {
    flexShrink: 0,
  },
  avatarImageContainer: {
    position: 'relative',
    width: 32,
    height: 32,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  
  onlineIndicator: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    backgroundColor: '#00d26a',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  otherUserMessageBubble: {
    flex: 1,
    backgroundColor: '#f1f3f4',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
   
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 2,
  },
  userName: {
    fontWeight: '600',
    fontSize: 13,
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: 11,
    color: '#666666',
  },
  otherUserMessageText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#1a1a1a',
  },
 
  // Current user message styles
  currentUserMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  currentUserMessageBubble: {
    maxWidth: '70%',
    backgroundColor: '#007bff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  currentUserMessageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  currentUserMessageTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
    marginTop: 4,
  },
});

export default ProductionCustomMessage;
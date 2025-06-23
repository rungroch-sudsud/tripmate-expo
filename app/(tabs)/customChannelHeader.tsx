
import { StreamChat } from 'stream-chat';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Channel,
  Chat,
  Window,
  MessageInput,
  Thread,
  LoadingIndicator,
  MessageList,
  useMessageContext,
  useChatContext
} from 'stream-chat-react';
import TripCard from './TripCard';
import type { Channel as StreamChannel } from 'stream-chat';
import { useRouter, useLocalSearchParams, router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { axiosInstance } from '../lib/axios';
// Remove this CSS import for React Native
// import 'stream-chat-react/dist/css/v2/index.css';
import { requirements } from '../requirement';




interface TripParticipant {
    userId: string;
    fullname: string;
    nickname: string;
    profileImageUrl: string;
    age: number;
    email: string;
  }

  const MAX_DISPLAYED_AVATARS = 3;
  const DEFAULT_AVATAR = 'https://via.placeholder.com/40x40/cccccc/666666?text=👤';


// Custom Channel Header Component
const CustomChannelHeader: React.FC<{ 
    participants: TripParticipant[]; 
    tripName: string;
    onBack: () => void;
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
      padding: 20,
      backgroundColor: '#fff',
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#d32f2f',
      marginBottom: 8,
    },
    errorText: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      marginBottom: 20,
    },
    errorButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    retryButton: {
      backgroundColor: '#007bff',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    backButtonError: {
      backgroundColor: '#6c757d',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    backButtonErrorText: {
      color: '#fff',
      fontWeight: '600',
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    backButton: {
      marginRight: 12,
    },
    backButtonText: {
      fontSize: 24,
      color: '#007bff',
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
      backgroundColor: '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: -8,
    },
    countText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#666',
    },
    groupInfo: {
      flex: 1,
    },
    participantCount: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
    },
    tripHint: {
      fontSize: 12,
      color: '#666',
    },
    // Message styles
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
      color: '#8e9297',
    },
    otherUserMessageText: {
      fontSize: 15,
      lineHeight: 20,
      color: '#2e3338',
    },
    backButtonDisabled: {
      opacity: 0.5,
    },
    backButtonTextDisabled: {
      color: '#999',
    }
  });


  export default CustomChannelHeader
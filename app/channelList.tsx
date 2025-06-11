// channelList.tsx - Shows all trips/chats the user has joined
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Alert, 
  StyleSheet,
  RefreshControl 
} from 'react-native';
import { useRouter } from 'expo-router';
import { StreamChat } from 'stream-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {axiosInstance} from '../lib/axios'; // Update this path

interface JoinedTripChannel {
  id: string;
  tripId: string;
  tripName: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  memberCount: number;
  unreadCount: number;
  members: Array<{
    id: string;
    name: string;
    image: string;
  }>;
}

const STREAM_API_KEY = 'mrffbdmcu86b';
const DEFAULT_AVATAR = 'https://via.placeholder.com/40x40/cccccc/666666?text=👤';
const MAX_DISPLAYED_AVATARS = 3;

export default function ChannelList() {
  const router = useRouter();
  const [channels, setChannels] = useState<JoinedTripChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<StreamChat | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const isMountedRef = useRef(true);

  // Get current user profile
  const getCurrentUser = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const response = await axiosInstance.get(`/users/profile/${userId}`);
      const userProfile = response.data.data;
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      return {
        id: userProfile.userId,
        name: userProfile.nickname || userProfile.fullname,
        image: userProfile.profileImageUrl !== 'N/A' 
          ? userProfile.profileImageUrl 
          : DEFAULT_AVATAR,
        profile: userProfile
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }, []);

  // Initialize Stream Chat client
  const initializeClient = useCallback(async (user: any) => {
    try {
      const chatClient = StreamChat.getInstance(STREAM_API_KEY);
      
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

      return chatClient;
    } catch (error) {
      console.error('Error initializing client:', error);
      throw error;
    }
  }, []);

  // Fetch user's joined channels
  const fetchJoinedChannels = useCallback(async (chatClient: StreamChat) => {
    try {
      console.log('🔍 Fetching channels for user:', chatClient.userID);
      
      const filter = {
        type: 'messaging',
        members: { $in: [chatClient.userID] }
      };
      
      const sort = { last_message_at: -1 };
      const options = { 
        limit: 50,
        state: true,
        watch: false
      };

      const channelsResponse = await chatClient.queryChannels(filter, sort, options);
      console.log('📋 Found channels:', channelsResponse.length);
      
      const joinedChannels: JoinedTripChannel[] = [];

      for (const channel of channelsResponse) {
        try {
          // Extract trip ID from channel ID (assuming format: "trip-{tripId}")
          const tripId = channel.data?.trip_id || channel.id?.replace('trip-', '');
          
          if (!tripId) {
            console.warn('⚠️ No trip ID found for channel:', channel.id);
            continue;
          }

          // Get channel members info
          const members = Object.values(channel.state.members || {}).map((member: any) => ({
            id: member.user?.id || '',
            name: member.user?.name || member.user?.id || 'Unknown',
            image: member.user?.image || DEFAULT_AVATAR
          }));

          // Get last message
          const lastMessage = channel.state.messages?.[channel.state.messages.length - 1];
          
          const joinedChannel: JoinedTripChannel = {
            id: channel.id,
            tripId: tripId,
            tripName: channel.data?.trip_name || channel.data?.name || `Trip ${tripId}`,
            lastMessage: lastMessage?.text || '',
            lastMessageTime: channel.state.last_message_at ? new Date(channel.state.last_message_at) : undefined,
            memberCount: Object.keys(channel.state.members || {}).length,
            unreadCount: channel.countUnread() || 0,
            members: members
          };

          joinedChannels.push(joinedChannel);
        } catch (channelError) {
          console.warn('⚠️ Error processing channel:', channel.id, channelError);
        }
      }

      console.log('✅ Processed channels:', joinedChannels.length);
      return joinedChannels;
    } catch (error) {
      console.error('❌ Error fetching channels:', error);
      throw error;
    }
  }, []);

  // Load channels
  const loadChannels = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      console.log('🔄 Loading channels...');
      
      const user = await getCurrentUser();
      if (!isMountedRef.current) return;
      
      setCurrentUser(user);
      
      const chatClient = await initializeClient(user);
      if (!isMountedRef.current) return;
      
      setClient(chatClient);
      
      const joinedChannels = await fetchJoinedChannels(chatClient);
      if (!isMountedRef.current) return;
      
      setChannels(joinedChannels);
      console.log('✅ Channels loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading channels:', error);
      if (isMountedRef.current) {
        setError(error.message || 'Failed to load channels');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [getCurrentUser, initializeClient, fetchJoinedChannels]);

  // Initialize on mount
  useEffect(() => {
    loadChannels();
    
    return () => {
      isMountedRef.current = false;
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [loadChannels]);

  // Handle channel selection
  const handleChannelPress = useCallback((channel: JoinedTripChannel) => {
    console.log('📱 Opening chat for trip:', channel.tripId);
    router.push(`/stramChat?tripId=${channel.tripId}`);
  }, [router]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push('/findTrips');
  }, [router]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadChannels(true);
  }, [loadChannels]);

  // Format time
  const formatTime = useCallback((date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    
    if (diffInHours < 1) {
      return 'เมื่อสักครู่';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('th-TH', { 
        weekday: 'short'
      });
    } else {
      return date.toLocaleDateString('th-TH', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }, []);

  // Render member avatars
  const renderMemberAvatars = useCallback((members: JoinedTripChannel['members']) => {
    const displayMembers = members.slice(0, MAX_DISPLAYED_AVATARS);
    const remainingCount = Math.max(0, members.length - MAX_DISPLAYED_AVATARS);

    return (
      <View style={styles.membersAvatars}>
        {displayMembers.map((member, index) => (
          <View 
            key={member.id} 
            style={[
              styles.memberAvatar, 
              { 
                zIndex: MAX_DISPLAYED_AVATARS - index,
                marginLeft: index > 0 ? -8 : 0 
              }
            ]}
          >
            <Image
              source={{ uri: member.image }}
              style={styles.memberAvatarImage}
              defaultSource={{ uri: DEFAULT_AVATAR }}
            />
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.memberAvatar, styles.remainingAvatar]}>
            <Text style={styles.remainingText}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  }, []);

  // Render channel item
  const renderChannelItem = useCallback(({ item }: { item: JoinedTripChannel }) => (
    <TouchableOpacity 
      style={styles.channelItem}
      onPress={() => handleChannelPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.channelLeft}>
        {renderMemberAvatars(item.members)}
      </View>
      
      <View style={styles.channelContent}>
        <View style={styles.channelHeader}>
          <Text style={styles.channelName} numberOfLines={1}>
            {item.tripName}
          </Text>
          {item.lastMessageTime && (
            <Text style={styles.channelTime}>
              {formatTime(item.lastMessageTime)}
            </Text>
          )}
        </View>
        
        <View style={styles.channelFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'ยังไม่มีข้อความ'}
          </Text>
          <View style={styles.channelMeta}>
            <Text style={styles.memberCount}>
              {item.memberCount} คน
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleChannelPress, renderMemberAvatars, formatTime]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>กำลังโหลดแชท...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>ไม่สามารถโหลดรายการแชทได้</Text>
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.errorButtons}>
          <TouchableOpacity onPress={() => loadChannels()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>ลองใหม่</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBack} style={styles.backButtonError}>
            <Text style={styles.backButtonErrorText}>กลับ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBackButton}>
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แชทของฉัน</Text>
      </View>
      
      {channels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>ยังไม่มีแชทกลุ่ม</Text>
          <Text style={styles.emptySubtext}>เข้าร่วมทริปเพื่อเริ่มแชทกับสมาชิกคนอื่น</Text>
          <TouchableOpacity 
            onPress={() => router.push('/findTrips')} 
            style={styles.findTripsButton}
          >
            <Text style={styles.findTripsButtonText}>ค้นหาทริป</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={channels}
          renderItem={renderChannelItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerBackButton: {
    marginRight: 16,
    padding: 8,
  },
  headerBackText: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  listContainer: {
    paddingVertical: 8,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  channelLeft: {
    marginRight: 12,
  },
  membersAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 23,
  },
  remainingAvatar: {
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  remainingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  channelContent: {
    flex: 1,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  channelTime: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  channelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
    marginRight: 8,
  },
  channelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    color: '#6c757d',
    marginRight: 8,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f3f4',
    marginHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc3545',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 32,
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
    backgroundColor: '#6c757d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  findTripsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  findTripsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
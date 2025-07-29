import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
  Platform,
 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreamChat } from 'stream-chat';
import { axiosInstance } from '../../lib/axios';
import { requirements } from '../../requirement';
import BottomNavigation from '../../components/customNavigation';
import {styles} from '../../css/channel_list'
// Types
interface ChannelData {
  id: string;
  name: string;
  image: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  tripId?: string;
  isOwner?: boolean;
  isDirect?: boolean;
  otherUserId?: string;
  participants?: string[];
}

interface User {
  id: string;
  name: string;
  image: string;
  email?: string;
}

// Singleton Stream Chat client
let globalStreamClient: StreamChat | null = null;
const getStreamChatClient = () => {
  if (!globalStreamClient) {
    globalStreamClient = StreamChat.getInstance(requirements.stream_api_key);
  }
  return globalStreamClient;
};

const DEFAULT_AVATAR = 'https://via.placeholder.com/50x50/cccccc/666666?text=👤';

export default function ChannelListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('owned'); // 'owned', 'joined', 'direct'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Channel data
  const [ownedChannels, setOwnedChannels] = useState<ChannelData[]>([]);
  const [joinedChannels, setJoinedChannels] = useState<ChannelData[]>([]);
  const [directChannels, setDirectChannels] = useState<ChannelData[]>([]);
  
  // Search
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const isMountedRef = useRef(true);

  // Initialize user and load channels
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          router.push('/login');
          return;
        }
        
        setCurrentUserId(userId);
        await loadAllChannels(userId);
      } catch (error) {
        console.error('Failed to initialize user:', error);
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    initializeUser();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load all channels
  const loadAllChannels = useCallback(async (userId: string) => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Initialize Stream Chat client
      const client = getStreamChatClient();
      
      // Get user profile for Stream Chat connection
      const userResponse = await axiosInstance.get(`/users/profile/${userId}`);
      const userProfile = userResponse.data.data;
      
      const currentUser = {
        id: userProfile.userId,
        name: userProfile.nickname || userProfile.fullname,
        image: userProfile.profileImageUrl !== 'N/A' ? userProfile.profileImageUrl : DEFAULT_AVATAR
      };

      // Connect to Stream Chat if not already connected
      if (client.userID !== currentUser.id) {
        if (client.userID) {
          await client.disconnectUser();
        }
        await client.connectUser(currentUser, client.devToken(currentUser.id));
      }

      // Fetch all channels the user is a member of
      const channels = await client.queryChannels(
        {
          members: { $in: [userId] },
          type: 'messaging'
        },
        { last_message_at: -1 },
        { limit: 100 }
      );

      // Separate channels by type
      const owned: ChannelData[] = [];
      const joined: ChannelData[] = [];
      const direct: ChannelData[] = [];

      for (const channel of channels) {
        const channelData = await processChannelData(channel, userId);
        
        if (channelData.isDirect) {
          direct.push(channelData);
        } else if (channelData.isOwner) {
          owned.push(channelData);
        } else {
          joined.push(channelData);
        }
      }

      if (isMountedRef.current) {
        setOwnedChannels(owned);
        setJoinedChannels(joined);
        setDirectChannels(direct);
      }

    } catch (error) {
      console.error('Failed to load channels:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'Failed to load channels');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Process channel data
  const processChannelData = async (channel: any, userId: string): Promise<ChannelData> => {
    const memberIds = Object.keys(channel.state.members || {});
    const otherMembers = memberIds.filter(id => id !== userId);
    
    // Check if it's a direct message (2 members total)
    const isDirect = memberIds.length === 2;
    
    let channelName = '';
    let channelImage = DEFAULT_AVATAR;
    let isOwner = false;
    let tripId = null;

    if (isDirect && otherMembers.length > 0) {
      // Direct message - get other user's info
      try {
        const otherUserResponse = await axiosInstance.get(`/users/profile/${otherMembers[0]}`);
        const otherUser = otherUserResponse.data.data;
        channelName = otherUser.nickname || otherUser.fullname;
        channelImage = otherUser.profileImageUrl !== 'N/A' ? otherUser.profileImageUrl : DEFAULT_AVATAR;
      } catch (error) {
        console.error('Failed to get other user info:', error);
        channelName = 'Direct Message';
      }
    } else {
      // Group channel - check if it's a trip channel
      const channelId = channel.id;
      if (channelId?.startsWith('trip-')) {
        tripId = channelId.replace('trip-', '');
        try {
          const tripResponse = await axiosInstance.get(`/trips/${tripId}`);
          const trip = tripResponse.data.data;
          channelName = trip.name;
          channelImage = trip.tripCoverImageUrl || DEFAULT_AVATAR;
          isOwner = trip.tripOwnerId === userId;
        } catch (error) {
          console.error('Failed to get trip info:', error);
          channelName = channel.data?.name || 'Group Chat';
        }
      } else {
        channelName = channel.data?.name || 'Group Chat';
        channelImage = channel.data?.image || DEFAULT_AVATAR;
      }
    }

    const lastMessage = channel.state.messages?.[channel.state.messages.length - 1];
    
    return {
      id: channel.id,
      name: channelName,
      image: channelImage,
      lastMessage: lastMessage?.text || 'No messages yet',
      lastMessageTime: lastMessage?.created_at ? formatTime(lastMessage.created_at) : '',
      unreadCount: channel.countUnread(),
      tripId,
      isOwner,
      isDirect,
      otherUserId: isDirect ? otherMembers[0] : undefined,
      participants: memberIds
    };
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { 
      return date.toLocaleDateString('th-TH', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' });
    }
  };

  // Search users
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || !currentUserId) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}`);
      const users = response.data.data || [];
      
      // Filter out current user
      const filteredUsers = users
        .filter((user: any) => user.userId !== currentUserId)
        .map((user: any) => ({
          id: user.userId,
          name: user.nickname || user.fullname,
          image: user.profileImageUrl !== 'N/A' ? user.profileImageUrl : DEFAULT_AVATAR,
          email: user.email
        }));

      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [currentUserId]);

  // Handle search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'direct') {
        searchUsers(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab, searchUsers]);

  // Handle channel press
  const handleChannelPress = useCallback((channel: ChannelData) => {
    if (channel.tripId) {
      // Navigate to trip group chat
      router.push(`/streamChat?tripId=${channel.tripId}`);
    } else if (channel.isDirect && channel.otherUserId) {
      // Navigate to direct message
      //router.push(`/DirectMessage?userId=${channel.otherUserId}`);
    }
  }, [router]);

  // Create direct message
  const createDirectMessage = useCallback(async (otherUser: User) => {
    if (!currentUserId) return;

    try {
      const client = getStreamChatClient();
      const channelId = `dm-${[currentUserId, otherUser.id].sort().join('-')}`;
      
      const channel = client.channel('messaging', channelId, {
        members: [currentUserId, otherUser.id],
        name: `${otherUser.name}`,
      });

      await channel.create();
      
      // Navigate to the direct message
     // router.push(`/DirectMessage?userId=${otherUser.id}`);
    } catch (error) {
      console.error('Failed to create direct message:', error);
      Alert.alert('Error', 'Failed to start conversation');
    }
  }, [currentUserId, router]);

  // Refresh channels
  const handleRefresh = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsRefreshing(true);
    await loadAllChannels(currentUserId);
  }, [currentUserId, loadAllChannels]);

  // Get filtered channels
  const getFilteredChannels = () => {
    let channels: ChannelData[] = [];
    
    switch (activeTab) {
      case 'owned':
        channels = ownedChannels;
        break;
      case 'joined':
        channels = joinedChannels;
        break;
      case 'direct':
        channels = directChannels;
        break;
    }

    if (!searchQuery.trim()) return channels;

    return channels.filter(channel =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const webShadowStyle = Platform.OS === 'web' ? { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' } : {};

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header]}>
        <Text style={styles.headerTitle}>แชท</Text>
       <TouchableOpacity onPress={()=>router.push('/Notification')}>
         <Image 
            source={require('../assets/images/notification-active-icon.png')} 
            style={{width:28,height:28}} 
          />
       </TouchableOpacity>
      </View>

    

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'owned' && {backgroundColor:'#585DDB',borderRadius:30,height:36,paddingVertical:20,justifyContent:'center',marginTop:30}]}
          onPress={() => setActiveTab('owned')}
        >
          <Text style={[styles.tabText, activeTab === 'owned' && {color:'#FFFFFF'}]}>
            แชทรวม
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'joined' && {backgroundColor:'#FF956E',borderRadius:30,height:36,paddingVertical:20,justifyContent:'center',marginTop:30}]}
          onPress={() => setActiveTab('joined')}
        >
          <Text style={[styles.tabText, activeTab === 'joined' && {color:'#FFFFFF'}]}>
            แชทกลุ่ม
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'direct' && {backgroundColor:'#FACC15',borderRadius:30,height:36,paddingVertical:20,justifyContent:'center',marginTop:30}]}
          onPress={() => setActiveTab('direct')}
        >
          <Text style={[styles.tabText, activeTab === 'direct' && {color:'#FFFFFF'}]}>
            แชท
          </Text>
        </TouchableOpacity>
      </View>

        {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
             <Image
           source={require('../assets/images/images/images/image9.png')} 
            style={styles.searchIcon}
          /> 
          <TextInput
            style={styles.searchInput}
            placeholder='ค้นหาแชท หรือ ชื่อผู้ใช้'
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              {/*   <Image
                source={require('../assets/images/close-icon.png')}
                style={styles.clearIcon}
              /> */}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#585DDB" />
            <Text style={styles.loadingText}>กำลังโหลด...</Text>
          </View>
        ) : (
          <>
            {/* Search Results for Direct Messages */}
            {activeTab === 'direct' && searchQuery.trim() && (
              <View style={styles.searchResultsContainer}>
                <Text style={styles.sectionTitle}>ผลการค้นหา</Text>
                {isSearching ? (
                  <ActivityIndicator size="small" color="#585DDB" />
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.userItem}
                      onPress={() => createDirectMessage(user)}
                    >
                      <Image source={{ uri: user.image }} style={styles.userAvatar} />
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                      </View>
                     {/*} <Image
                        source={require('../assets/images/chat-icon.png')}
                        style={styles.chatIcon}
                      /> */}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noResultsText}>ไม่พบผู้ใช้</Text>
                )}
              </View>
            )}

            {/* Channel List */}
            <View style={styles.channelListContainer}>
              {getFilteredChannels().length > 0 ? (
                getFilteredChannels().map((channel) => (
                  <TouchableOpacity
                    key={channel.id}
                    style={styles.channelItem}
                    onPress={() => handleChannelPress(channel)}
                  >
                    <Image source={{ uri: channel.image }} style={styles.channelAvatar} />
                    <View style={styles.channelInfo}>
                      <View style={styles.channelHeader}>
                        <Text style={styles.channelName} numberOfLines={1}>
                          {channel.name}
                        </Text>
                        {channel.lastMessageTime && (
                          <Text style={styles.messageTime}>{channel.lastMessageTime}</Text>
                        )}
                      </View>
                      <View style={styles.channelFooter}>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                          {channel.lastMessage}
                        </Text>
                        {channel.unreadCount > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCount}>
                              {/*{channel.unreadCount > 99 ? '99+' : channel.unreadCount}*/}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {activeTab === 'owned' ? 'ยังไม่มีทริปที่สร้าง' :
                     activeTab === 'joined' ? 'ยังไม่มีทริปที่เข้าร่วม' :
                     'ยังไม่มีข้อความส่วนตัว'}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      {currentUserId && (
        <BottomNavigation currentScreen="channel" userId={currentUserId} />
      )}
    </SafeAreaView>
  );
}


// components/ChatScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import {
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from 'stream-chat-react';
import { Channel as StreamChannel } from 'stream-chat';
import { useChatContext } from './ChatContext';

const ChatScreen: React.FC = () => {
  const { client, isConnected } = useChatContext();
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null);
  const [showThread, setShowThread] = useState(false);

  if (!isConnected) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Connecting to chat...</Text>
      </View>
    );
  }

  const filters = {
    type: 'messaging',
    members: { $in: [client.userID] },
  };

  const sort = { last_message_at: -1 };

  const handleChannelSelect = (channel: StreamChannel) => {
    setActiveChannel(channel);
    setShowThread(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.channelList}>
        <Text style={styles.header}>Your Chats</Text>
        <ChannelList
          filters={filters}
          sort={sort}
          onSelect={handleChannelSelect}
        />
      </View>
      
      {activeChannel ? (
        <View style={styles.chatArea}>
          <Channel channel={activeChannel}>
            <Window>
              <MessageList />
              <MessageInput />
            </Window>
            {showThread && <Thread />}
          </Channel>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Select a chat to start messaging
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
  },
  channelList: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  chatArea: {
    flex: 2,
    backgroundColor: '#ffffff',
  },
  emptyState: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default ChatScreen;
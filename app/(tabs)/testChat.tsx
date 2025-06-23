// testChat.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { ChatProvider, useChatContext } from './ChatContext';
import ChatScreen from './ChatScreen';
import { TripChatButton, SimpleChatButton } from './TripChatButton';

// Component that uses the chat context
const TestChatContent: React.FC = () => {
  const { connectUserToChat, isConnected, user } = useChatContext();

  useEffect(() => {
    // Auto-connect a test user when component mounts
    const connectTestUser = async () => {
      try {
        const testUser = {
          id: `user-${Date.now()}`, // Unique user ID
          name: 'Test User',
        };
        
        await connectUserToChat(testUser);
        console.log('Test user connected:', testUser);
      } catch (error) {
        console.error('Failed to connect test user:', error);
      }
    };

    if (!isConnected && !user) {
      connectTestUser();
    }
  }, [isConnected, user, connectUserToChat]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stream Chat Test</Text>
        <Text style={styles.status}>
          Status: {isConnected ? '✅ Connected' : '⏳ Connecting...'}
        </Text>
        {user && (
          <Text style={styles.userInfo}>
            Logged in as: {user.name} (ID: {user.id})
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Chat Buttons</Text>
        
        <TripChatButton
          tripId="test-trip-1"
          tripName="Test Trip Chat"
          tripMembers={[user?.id || 'user-123', 'user-456']}
          onChatOpen={() => console.log('Chat opened!')}
          style={styles.chatButton}
        />

        <SimpleChatButton
          tripId="test-trip-2"
          tripMembers={[user?.id || 'user-123', 'user-789']}
          onChatOpen={() => console.log('Simple chat opened!')}
          style={styles.simpleChatButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Full Chat Interface</Text>
        <View style={styles.chatContainer}>
          <ChatScreen />
        </View>
      </View>
    </ScrollView>
  );
};

// Main component with provider
const TestChat: React.FC = () => {
  return (
    <ChatProvider>
      <TestChatContent />
    </ChatProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chatButton: {
    marginBottom: 12,
  },
  simpleChatButton: {
    alignSelf: 'flex-start',
  },
  chatContainer: {
    height: 400,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
});

export default TestChat;
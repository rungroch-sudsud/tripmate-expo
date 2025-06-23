// components/TripChatButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert } from 'react-native';
import { useChatContext } from './ChatContext';

interface TripChatButtonProps {
  tripId: string;
  tripName?: string;
  tripMembers: string[];
  onChatOpen?: () => void;
  style?: any;
}

export const TripChatButton: React.FC<TripChatButtonProps> = ({
  tripId,
  tripName = 'Trip Chat',
  tripMembers,
  onChatOpen,
  style,
}) => {
  const { createChannel, isConnected, client } = useChatContext();

  const handlePress = async () => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please wait while we connect you to chat...');
      return;
    }

    try {
      // Check if channel already exists
      const existingChannels = await client.queryChannels({
        type: 'messaging',
        id: `trip-${tripId}`,
      });

      let channel;
      if (existingChannels.length > 0) {
        // Channel exists, use it
        channel = existingChannels[0];
      } else {
        // Create new channel
        channel = await createChannel('messaging', `trip-${tripId}`, tripMembers);
      }

      console.log('Trip chat opened:', channel.id);
      onChatOpen?.();
    } catch (error) {
      console.error('Error opening trip chat:', error);
      Alert.alert('Error', 'Failed to open trip chat. Please try again.');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, !isConnected && styles.buttonDisabled, style]} 
      onPress={handlePress}
      disabled={!isConnected}
    >
      <View style={styles.buttonContent}>
        <Text style={[styles.buttonText, !isConnected && styles.buttonTextDisabled]}>
          💬 {tripName}
        </Text>
        {!isConnected && (
          <Text style={styles.statusText}>Connecting...</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Alternative simple chat button
export const SimpleChatButton: React.FC<TripChatButtonProps> = ({
  tripId,
  tripMembers,
  onChatOpen,
  style,
}) => {
  const { createChannel, isConnected } = useChatContext();

  const handlePress = async () => {
    if (!isConnected) return;

    try {
      await createChannel('messaging', `trip-${tripId}`, tripMembers);
      onChatOpen?.();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.simpleButton, style]} 
      onPress={handlePress}
      disabled={!isConnected}
    >
      <Text style={styles.simpleButtonText}>Chat</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextDisabled: {
    color: '#999',
  },
  statusText: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  simpleButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  simpleButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default TripChatButton;
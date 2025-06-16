import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TripParticipant {
  userId: string;
  fullname: string;
  nickname?: string;
  profileImageUrl?: string;
}

interface CustomMessageListProps {
  messages: any[]; // Pass messages directly as prop
  participants: TripParticipant[];
  onUserProfilePress: (participant: TripParticipant | null, userId: string) => void;
}

const MyCustomMessage = ({ 
  message, 
  participants, 
  onUserProfilePress 
}: { 
  message: any; 
  participants: TripParticipant[];
  onUserProfilePress: (participant: TripParticipant | null, userId: string) => void;
}) => {
  if (!message?.user?.id || !message.text) {
    return null;
  }

  const user = message.user;
  const participantData = participants.find(p => p.userId === user.id);
  
  const displayName = participantData 
    ? (participantData.nickname || participantData.fullname)
    : (user.name || user.id || 'Unknown User');

  const handleUserPress = () => {
    onUserProfilePress(participantData || null, user.id);
  };

  return (
    <View style={styles.messageContainer}>
      <TouchableOpacity onPress={handleUserPress} activeOpacity={0.7}>
        <Text style={styles.user}>{displayName}</Text>
      </TouchableOpacity>
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
};

const CustomMessageList: React.FC<CustomMessageListProps> = ({ 
  messages, 
  participants, 
  onUserProfilePress 
}) => {
  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MyCustomMessage 
          message={item} 
          participants={participants}
          onUserProfilePress={onUserProfilePress}
        />
      )}
      inverted
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 10 }}
    />
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    backgroundColor: '#eee',
    marginVertical: 4,
    borderRadius: 6,
  },
  user: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  text: {
    marginTop: 2,
  },
});

export default CustomMessageList;
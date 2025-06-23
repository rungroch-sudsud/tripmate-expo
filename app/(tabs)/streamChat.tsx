import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router'; 
import { StreamChat } from 'stream-chat';
import { Chat, Channel, MessageList, MessageInput } from 'stream-chat-react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requirements } from '../requirement';

const StreamChatPage = () => {
  const searchParams = useLocalSearchParams();
  const tripId = searchParams.tripId as string;

  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    let chatClient: StreamChat;

    const initChat = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error("Missing user ID");
        return;
      }

      chatClient = StreamChat.getInstance(requirements.stream_api_key);

      await chatClient.connectUser(
        {
          id: userId,
          name: 'User Name',
        },
        chatClient.devToken(userId)
      );

      const channelId = `trip-${tripId}`;
      const tripChannel = chatClient.channel('messaging', channelId, {
        name: `Trip ${tripId} Chat`,
        members:['9A4xwG1AMqNt7Ndcko4V7PisuVf2']
      });

      try {
        await tripChannel.watch();

        const existingMembers = Object.keys(tripChannel.state.members);
        if (!existingMembers.includes(userId)) {
          await tripChannel.addMembers([userId]);
        }

        setClient(chatClient);
        setChannel(tripChannel);
      } catch (err) {
        console.error("Error joining or watching the channel:", err);
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [tripId]);

  if (!client || !channel) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Chat client={client}>
      <Channel channel={channel}>
        <MessageList />
        <MessageInput />
      </Channel>
    </Chat>
  );
};

export default StreamChatPage;

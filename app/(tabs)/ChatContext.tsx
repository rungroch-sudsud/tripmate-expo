// contexts/ChatContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import { streamClient, connectUser, disconnectUser } from './streamchatConfig';

interface User {
  id: string;
  name: string;
}

interface ChatContextType {
  client: StreamChat;
  user: User | null;
  isConnected: boolean;
  connectUserToChat: (user: User) => Promise<void>;
  disconnectUserFromChat: () => Promise<void>;
  createChannel: (channelType: string, channelId: string, members: string[]) => Promise<StreamChannel>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectUserToChat = async (userData: User) => {
    try {
      await connectUser(userData.id, userData.name);
      setUser(userData);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting user to chat:', error);
      setIsConnected(false);
    }
  };

  const disconnectUserFromChat = async () => {
    try {
      await disconnectUser();
      setUser(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting user from chat:', error);
    }
  };

  const createChannel = async (channelType: string, channelId: string, members: string[]) => {
    if (!streamClient.userID) {
      throw new Error('User must be connected before creating a channel');
    }

    const channel = streamClient.channel(channelType, channelId, {
      members,
      name: `Trip Chat - ${channelId}`,
    });

    await channel.create();
    return channel;
  };

  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnectUserFromChat();
      }
    };
  }, []);

  const value: ChatContextType = {
    client: streamClient,
    user,
    isConnected,
    connectUserToChat,
    disconnectUserFromChat,
    createChannel,
  };

  return (
    <ChatContext.Provider value={value}>
      {isConnected ? (
        <Chat client={streamClient} theme="messaging light">
          {children}
        </Chat>
      ) : (
        children
      )}
    </ChatContext.Provider>
  );
};
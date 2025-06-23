// streamchatConfig.ts
import { StreamChat } from 'stream-chat';
import {requirements} from '../requirement'
// Replace with your Stream API credentials from Stream Dashboard
const API_KEY = `${requirements.stream_api_key}`;
const API_SECRET = `${requirements.stream_api_secret}`; // WARNING: Only for development!

// Create Stream client instance
export const streamClient = StreamChat.getInstance(API_KEY);

// Generate token on frontend (DEVELOPMENT ONLY)
const generateToken = (userId: string): string => {
  // WARNING: This exposes your API secret on the frontend
  // Only use this for development/testing
  const serverClient = StreamChat.getInstance(API_KEY, API_SECRET);
  return serverClient.createToken(userId);
};

// User authentication function with frontend token generation
export const connectUser = async (userId: string, userName: string) => {
  try {
    // Option 1: Generate token on frontend (less secure)
    // const userToken = generateToken(userId);
    
    // Option 2: Use development tokens (recommended for development)
    const userToken = streamClient.devToken(userId);
    
    await streamClient.connectUser(
      {
        id: userId,
        name: userName,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      },
      userToken
    );
    console.log('User connected successfully');
  } catch (error) {
    console.error('Failed to connect user:', error);
  }
};

// Disconnect user
export const disconnectUser = async () => {
  try {
    await streamClient.disconnectUser();
    console.log('User disconnected successfully');
  } catch (error) {
    console.error('Failed to disconnect user:', error);
  }
};
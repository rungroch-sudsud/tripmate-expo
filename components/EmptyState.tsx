// EmptyState.tsx
import React from 'react';
import { View, Text } from 'react-native';
import styles from '../css/findTrip_css';

interface EmptyStateProps {
  searchQuery: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>
      {searchQuery ? `ไม่พบทริปที่ชื่อ "${searchQuery}"` : 'ไม่พบทริปในหมวดหมู่นี้'}
    </Text>
  </View>
);
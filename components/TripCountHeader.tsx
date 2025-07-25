// components/TripCountHeader.js
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from '../css/findTrip_css';
import FilterModal from './calendar';

interface TripCountHeaderProps {
  count: number;
  onApplyFilters: (filters: {
    startDate: Date | null;
    endDate: Date | null;
    priceRange: {
      id: string;
      label: string;
      min: number;
      max: number;
    };
  }) => void;
  currentDateRange?: {
    startDate: Date | null;
    endDate: Date | null;
  };
  currentPriceRange?: {
    id: string;
    label: string;
    min: number;
    max: number;
  };
  hasActiveFilters?: boolean;
}

export const TripCountHeader: React.FC<TripCountHeaderProps> = ({ 
  count, 
  onApplyFilters,
  currentDateRange = { startDate: null, endDate: null },
  currentPriceRange = { id: 'all', label: 'ทุกราคา', min: 0, max: Infinity },
  hasActiveFilters = false
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleFilterPress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleApplyFilters = (filters) => {
    onApplyFilters(filters);
    setIsModalVisible(false);
  };

  return (
    <>
      <View style={styles.tripCountContainer}>
        <Text style={styles.tripCountText}>
          พบ {count} ทริป
        </Text>
        <TouchableOpacity 
          style={[
            styles.filterButton,
         
          ]}
          onPress={handleFilterPress}
        >
          <Image 
            source={require('../app/assets/images/images/images/image29.png')} 
            style={[
              styles.filterIcon
            ]}
          />
          
        </TouchableOpacity>
      </View>

      <FilterModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onApplyFilters={handleApplyFilters}
        initialStartDate={currentDateRange.startDate}
        initialEndDate={currentDateRange.endDate}
        initialPriceRange={currentPriceRange}
      />
    </>
  );
};
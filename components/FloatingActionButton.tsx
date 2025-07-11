import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import styles from '../css/findTrip_css';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => (
  <TouchableOpacity
    style={styles.floatingButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Image source={require('../app/assets/images/images/images/image27.png')} style={{height:21,width:21}}/>
  </TouchableOpacity>
);

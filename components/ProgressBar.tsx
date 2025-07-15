import React from 'react';
import { View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressBarProps {
  animation: Animated.Value;
  styles?: any;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ animation, styles }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: animation.interpolate({
                inputRange: [0, 33.33],
                outputRange: ['0%', '33.33%'],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={['#585DDB', '#FF956E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, borderRadius: 2 }}
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default ProgressBar;
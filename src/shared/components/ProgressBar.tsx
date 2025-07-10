import React from 'react';
import { View, Animated } from 'react-native';

interface ProgressBarProps {
  animation: Animated.Value,
  styles?:any
}

const ProgressBar: React.FC<ProgressBarProps> = ({ animation,styles }) => {
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
        />
      </View>
    </View>
  );
};

export default ProgressBar;
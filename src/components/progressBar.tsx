import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

const ProgressBar = ({ progress = 33.33, style, fillStyle }) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnimation]);

  return (
    <View style={[{ height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 }, style]}>
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: '#6366f1',
            borderRadius: 2,
            width: progressAnimation.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
          fillStyle,
        ]}
      />
    </View>
  );
};

export default ProgressBar;
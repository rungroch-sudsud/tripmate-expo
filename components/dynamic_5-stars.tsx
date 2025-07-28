import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StarRating = ({ rating }: { rating: number }) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars (FACC15)
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons 
          key={`full-${i}`}
          name='star' 
          style={{color:'#FACC15', height:30, width:33.75}}
        />
      );
    }

    // Half star (if needed)
    if (hasHalfStar) {
      const decimal = rating % 1;
      const goldPercentage = decimal >= 0.5 ? 60 : Math.round(decimal * 100);
      const grayPercentage = 100 - goldPercentage;

      stars.push(
        <View key="half" style={{ position: 'relative', height: 30, width: 33.75 }}>
          {/* Bottom layer - always gold */}
          <Ionicons 
            name='star' 
            style={{
              color: '#FACC15',
              position: 'absolute',
              height: 30,
              width: 33.75
            }}
          />
          {/* Top layer - gray with clip */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: 30,
            width: 33.75,
            overflow: 'hidden'
          }}>
            <View style={{
              height: `${grayPercentage}%`,
              backgroundColor: 'transparent',
              overflow: 'hidden'
            }}>
              <Ionicons 
                name='star' 
                style={{
                  color: '#F3F4F6',
                  height: 30,
                  width: 33.75,
                  marginTop: grayPercentage > 50 ? -((grayPercentage - 50) * 0.6) : 0
                }}
              />
            </View>
          </View>
        </View>
      );
    }

    // Empty stars (F3F4F6)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons 
          key={`empty-${i}`}
          name='star' 
          style={{color:'#F3F4F6', height:30, width:33.75}}
        />
      );
    }

    return stars;
  };

  return (
    <View style={{alignItems:'center'}}>
      <Text>
        {rating > 0 ? rating.toFixed(1) : '0.0'}
      </Text>
      <View style={{flexDirection:'row'}}>
        {renderStars()}
      </View>
    </View>
  );
};


export default StarRating
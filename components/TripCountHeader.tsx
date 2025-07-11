import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from '../css/findTrip_css';

interface TripCountHeaderProps {
  count: number;
}

export const TripCountHeader: React.FC<TripCountHeaderProps> = ({ count }) => (
  <View style={styles.tripCountContainer}>
    <Text style={styles.tripCountText}>
      พบ {count} ทริป
    </Text>
    <View style={{flex:0.1,backgroundColor:'#E5E7EB',justifyContent:'center',alignItems:'center',width:32,height:34,borderRadius:6}}>
      <Image source={require('../app/assets/images/images/images/image29.png')} style={{width:16,height:16}}/>
    </View>
    <View style={{flex:0.1,backgroundColor:'#FFFFFF',justifyContent:'center',alignItems:'center',width:34,height:34,borderRadius:6,borderWidth:1,borderColor:'#E5E7EB',marginLeft:5}}>
      <Image source={require('../app/assets/images/images/images/image30.png')} style={{width:16,height:20}}/>
    </View>
  </View>
);


// HeaderSection.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from '../css/findTrip_css';

export const HeaderSection: React.FC = () => (
  <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white',marginLeft:16,marginRight:16}}>
    <Text style={styles.headerTitle}>หาเพื่อนเที่ยว</Text>
    <Image 
      source={require('../app/assets/images/images/images/image16.png')} 
      style={{width:18,height:18,flex:0.05}} 
    />
    <Image 
      source={require('../app/assets/images/images/images/image17.png')} 
      style={{width:15.75,height:18,flex:0.05,marginLeft:10}} 
    />
  </View>
);
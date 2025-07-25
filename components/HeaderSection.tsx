
// HeaderSection.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from '../css/findTrip_css';

export const HeaderSection: React.FC = () => (
  <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white',justifyContent:'space-between',paddingTop:30,paddingBottom:20,marginHorizontal:16}}>
    <Text style={styles.headerTitle}>หาเพื่อนเที่ยว</Text>
    <Image 
      source={require('../app/assets/images/notification-active-icon.png')} 
      style={{width:28,height:28}} 
    />
  </View>
);
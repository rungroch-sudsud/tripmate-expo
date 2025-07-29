
// HeaderSection.tsx
import React from 'react';
import { View, Text, Image,TouchableOpacity } from 'react-native';
import styles from '../css/findTrip_css';
import {useRouter} from 'expo-router'
const HeaderSection = () => {

 const router=useRouter()

 return(
   <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white',justifyContent:'space-between',paddingTop:30,paddingBottom:20,marginHorizontal:16}}>
    <Text style={styles.headerTitle}>หาเพื่อนเที่ยว</Text>
       <TouchableOpacity onPress={()=>router.push('/(tabs)/Notification')}>
          <Image 
      source={require('../app/assets/images/notification-active-icon.png')} 
      style={{width:28,height:28}} 
    />
       </TouchableOpacity>
  </View>
 )
};


export default HeaderSection
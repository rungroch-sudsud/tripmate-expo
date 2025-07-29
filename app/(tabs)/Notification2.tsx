
import React from 'react';
import { View, Text, Image,SafeAreaView,ScrollView } from 'react-native';
import {Stack} from 'expo-router'
const Notification2 = () => {
 return(
<SafeAreaView style={{backgroundColor:'white',flex:1}}>
      <Stack.Screen options={{ headerShown: false }} />
          <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white',justifyContent:'space-between',paddingTop:30,paddingBottom:20,marginHorizontal:16}}>
    <Text style={{
    fontSize: 16,
    color: '#374151',
    textAlign: 'left',
    fontWeight:'700',
    fontFamily:'LineSeedSansTH_A_Bd',
    }}>การแจ้งเตือน</Text>
    <Image 
      source={require('../assets/images/notification-active-icon.png')} 
      style={{width:28,height:28}} 
    />
  </View>
</SafeAreaView>
 )
};


export default Notification2
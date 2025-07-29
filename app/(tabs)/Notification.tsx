import { 
  FontAwesome, 
  MaterialIcons, 
  Ionicons,
  AntDesign 
} from '@expo/vector-icons';
import React from 'react';
import { View, Text, Image,SafeAreaView,ScrollView,TouchableOpacity } from 'react-native';
import {Stack,useRouter} from 'expo-router'
const Notification = () => {
  const router=useRouter()

 return(
<SafeAreaView style={{backgroundColor:'white',flex:1}}>
      <Stack.Screen options={{ headerShown: false }} />

          <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white',paddingTop:30,paddingBottom:20,marginHorizontal:16,  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',borderWidth:0}}>
                <TouchableOpacity style={{  padding: 10, // provides tap area
  borderRadius: 20,
  justifyContent: 'center',
  alignSelf:'flex-start',
  alignItems: 'center',}} onPress={()=>router.push('/findTrips')}
         hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
       <Image source={require('../assets/images/home-back.png')} style={{tintColor:'#374151',height:24,width:24}}/>
        </TouchableOpacity>
    <Text style={{
    fontSize: 16,
    marginLeft:100,
    color: '#374151',
    textAlign: 'center',
    fontWeight:'700',
    fontFamily:'LineSeedSansTH_A_Bd',
    }}>การแจ้งเตือน</Text>
    
  </View>
<ScrollView style={{padding:40}}>
    <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10,fontWeight:'bold'}}>
      วันนี้, ก.ค. 7
    </Text>
    <View style={{marginTop:20,boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',padding:10,borderRadius:10,width:'100%',flexDirection:'row',alignItems:'center',marginBottom:10}}>
     <FontAwesome name="exclamation-circle" size={24} color="#FACC15" />
        <View style={{marginLeft:30}}>
      <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'bold',fontSize:12}}>📢 มีเพื่อนใหม่อยากร่วมทริปกับคุณแล้ว!</Text>
      <Text style={{color:'#6B7280',fontFamily:'LineSeedSansTH',fontSize:8,fontWeight:'400',width:'100%'}}>เขาพร้อมจอยมาก รอหัวตี้ไปกด “ยืนยันรับเงิน” อยู่นะจั้ฟ 😎<Text style={{color:'#9CA3AF',fontFamily:'LineSeedSansTH',fontSize:8,textAlign:'right',marginLeft:60}}>22:00</Text></Text>
        </View>
    </View>
     <View style={{marginTop:20,boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',padding:10,borderRadius:10,width:'100%',flexDirection:'row',alignItems:'center',marginBottom:10}}>
     <FontAwesome name="exclamation-circle" size={24} color="#FACC15" />
        <View style={{marginLeft:30}}>
      <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'bold',fontSize:12}}>@น้ำใส เข้าร่วมทริปแล้ว 🥳</Text>
      <Text style={{color:'#6B7280',fontFamily:'LineSeedSansTH',fontSize:8,fontWeight:'400',width:'100%'}}>หัวตี้อย่าลืมอัปเดตแผนหรือชวนคุยในกรุ๊ปกันนะ<Text style={{color:'#9CA3AF',fontFamily:'LineSeedSansTH',fontSize:8,textAlign:'right',marginLeft:60}}>22:00</Text></Text>
        </View>
    </View>
     <View style={{marginTop:20,boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',padding:10,borderRadius:10,width:'100%',flexDirection:'row',alignItems:'center',marginBottom:10}}>
     <FontAwesome name="exclamation-circle" size={24} color="#FACC15" />
        <View style={{marginLeft:30}}>
      <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'bold',fontSize:12}}>มีเพื่อนอยากไปเที่ยวด้วย! 🎒</Text>
      <Text style={{color:'#6B7280',fontFamily:'LineSeedSansTH',fontSize:8,fontWeight:'400',width:'100%'}}>@น้ำใส กดขอจอยทริป “ทริปภูเก็ต 3 วัน 2 คืน” แล้วน้าา กดดูรายละเอียดแล้วกดรับได้เลย~<Text style={{color:'#9CA3AF',fontFamily:'LineSeedSansTH',fontSize:8,textAlign:'right',marginLeft:60}}>22:00</Text></Text>
        </View>
    </View>
      <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10,fontWeight:'bold',marginTop:20}}>
     เมื่อวาน, ก.ค. 6
    </Text>
        <View style={{marginTop:20,boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',padding:10,borderRadius:10,width:'100%',flexDirection:'row',alignItems:'center',marginBottom:10}}>
     <FontAwesome name="exclamation-circle" size={24} color="#FACC15" />
        <View style={{marginLeft:30}}>
      <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'bold',fontSize:12}}>ใกล้วันเที่ยวแล้วน้าา ✈️</Text>
      <Text style={{color:'#6B7280',fontFamily:'LineSeedSansTH',fontSize:8,fontWeight:'400',width:'100%'}}>ทริป “แคมป์ปิ้งเขาใหญ่ สายลุย” ของคุณจะเริ่มในอีก 3 วัน! เตรียมเสื้อผ้าให้พร้อม~<Text style={{color:'#9CA3AF',fontFamily:'LineSeedSansTH',fontSize:8,textAlign:'right',marginLeft:60}}>22:00</Text></Text>
        </View>
    </View>

   <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontSize:10,fontWeight:'bold',marginTop:20}}>
     ก.ค. 1
    </Text>
            <View style={{marginTop:20,boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',padding:10,borderRadius:10,width:'100%',flexDirection:'row',alignItems:'center',marginBottom:10}}>
     <FontAwesome name="exclamation-circle" size={24} color="#FACC15" />
        <View style={{marginLeft:30}}>
      <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'bold',fontSize:12}}>หัวตี้อัปเดตแผนทริปแล้วน้า! 🗺️</Text>
      <Text style={{color:'#6B7280',fontFamily:'LineSeedSansTH',fontSize:8,fontWeight:'400',width:'100%'}}><Text style={{color:'#9CA3AF',fontFamily:'LineSeedSansTH',fontSize:8,textAlign:'right',marginLeft:60}}>22:00</Text></Text>
        </View>
    </View>
  
    
  </ScrollView>
</SafeAreaView>
 )
};


export default Notification
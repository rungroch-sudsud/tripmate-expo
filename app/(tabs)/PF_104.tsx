import {Image,View,Text,ScrollView,TouchableOpacity,SafeAreaView,ImageBackground,StyleSheet} from 'react-native'
import {use, useEffect,useState} from 'react'
import React from 'react'
import {useLocalSearchParams,useRouter,Stack, router} from  'expo-router'
import {fetchUserTravelProperties,getUserProfile} from '../../features/user/services/userServices'
import  {LinearGradient} from 'expo-linear-gradient'
import {Ionicons} from '@expo/vector-icons'
interface TravelItem {
  id: string
  title: string
}

const PF_104:React.FC=()=>{
const { owner } = useLocalSearchParams()
const user = owner ? JSON.parse(owner as string) : null
const [travelStyles, setTravelStyles] = useState<string[]>([])
const [travelPersonalities, setTravelPersonalities] = useState<string[]>([])
const [transportationStyles, setTransportationStyles] = useState<string[]>([])
const [reviewer,setReviewer]=useState([])

useEffect(() => {
  const fetchData = async () => {
    if (user?.userId) {
      try {
        const response = await fetchUserTravelProperties(user.userId)
        if (response) {
          // Extract titles from the array of objects
          setTravelStyles(response.travelStyles.map((item: TravelItem) => item.title))
          setTravelPersonalities(response.travelPersonalities.map((item: TravelItem) => item.title))
          setTransportationStyles(response.transportation.map((item: TravelItem) => item.title))
        }
      } catch (error) {
        console.error('Error fetching travel properties:', error)
      }
    }
  }


  const reviewerProfile=async ()=>{
          
  }

  reviewerProfile()
  
  fetchData()
}, [user?.userId])

 const averageRating = user?.reviews?.length > 0
  ? user?.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length
  : 0;

   return(
  <LinearGradient
  colors={['#585DDB','#FF956E']}
  start={{x:0,y:0}}
  end={{x:1,y:0}}
  style={{flex:1}}
  >
      <SafeAreaView style={{flex:1,alignItems:'center'}}>
        <Stack.Screen options={{headerShown:false}}/>
          <TouchableOpacity onPress={()=>router.push('/findTrips')} style={{position:'absolute',top:40,left:30}}>
                  <Image source={require('../assets/images/home-back.png')}/>
          </TouchableOpacity>
            <View style={{zIndex:2,position:'absolute',backgroundColor:'#FFFFFF',borderRadius:20,top:77}}>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                        {user.profileImageUrl ?(
                            <Image source={{uri:user.profileImageUrl}} style={{height:90,width:90,borderRadius:20,borderWidth:10,borderColor:'#E5E7EB'}}/>
                        ):<Image source={require('../assets/images/default.jpeg')} style={{height:90,width:90,borderRadius:20,borderWidth:10,borderColor:'#E5E7EB'}}/>}
                        <View>
                           <View style={{flexDirection:'row'}}>
                            <Text style={{fontFamily:'LineSeedSansTH_A_Bd',color:'#374151',fontSize:24,fontWeight:'700'}}>{user.fullname}</Text>
                                <Ionicons name='star' style={{color:'#FACC15',height:10,width:10.08}}/>
                                <Text>{user.reviews?.length>0?
                                (user.reviews.rating/ user.reviews.length).toFixed(1):'0.0'}</Text>
                           </View> 
                           <Text>{user.occupation}</Text>
                           <View style={{flexDirection:'row'}}>
                                  <TouchableOpacity>
                                    <Image source={require('../assets/images/facebook.png')} style={{width:23,height:23,borderRadius:99999}}/>
                                    
                                  </TouchableOpacity>
                                   <TouchableOpacity>
                                    <Image source={require('../assets/images/instagram.png')} style={{width:23,height:23,borderRadius:99999}}/>
                                    
                                  </TouchableOpacity>
                           </View>
                        </View>
                  </View>
                  <View style={{flexDirection:'row',flex:1}}>
                    <View>
                        <Text>อายุ</Text>
                        <Text>{user.age}</Text>
                    </View>
                     <View>
                        <Text>เพศ</Text>
                        <Text>{user.gender}</Text>
                    </View>
                    <TouchableOpacity style={{backgroundColor:'#585DDB'}}>
                        <Text style={{color:'#FFFFFF'}}>เริ่มแชท</Text>
                    </TouchableOpacity>
                  </View>
            </View>

            <ScrollView style={{flex:1,position:'absolute',top:150,backgroundColor:'red',paddingTop:100,width:'100%',zIndex:1}}>
                <Text>Bio</Text>
                <Text>🧳 ชอบเที่ยวธรรมชาติ เดินป่า ชิวคาเฟ่ ถ่ายรูป 📸</Text>
                 <Text style={{}}>ความสนใจ</Text>
               <View style={{flexDirection:'row',backgroundColor:'#FFFFFF'}}>
               
                {travelStyles.map((style,index)=>(
                    <View key={index} style={{backgroundColor:'#F3F4F6',borderRadius:100,marginRight:20,paddingVertical:5,paddingHorizontal:15}}>
                        <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:10}}>{style}</Text>
                         </View>
                ))}
               </View>
                  <Text>สไตล์การเดินทาง</Text>
                  <Text>เป้าหมายท่องเที่ยว</Text>
                  <View style={{flexDirection:'row',backgroundColor:'#FFFFFF'}}>
               
                {user.destinations.map((destination,index)=>(
                    <View key={index} style={{backgroundColor:'#F3F4F6',borderRadius:100,marginRight:20,paddingVertical:5,paddingHorizontal:15}}>
                        <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:10}}>{destination}</Text>
                         </View>
                ))}
               </View>
                <Text>ประเภทท่องเที่ยว</Text>
                  <View style={{flexDirection:'row',backgroundColor:'#FFFFFF'}}>
               
                {travelPersonalities.map((style,index)=>(
                    <View key={index} style={{backgroundColor:'#F3F4F6',borderRadius:100,marginRight:20,paddingVertical:5,paddingHorizontal:15}}>
                        <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:10}}>{style}</Text>
                         </View>
                ))}
               </View> 

               <Text>รูปภาพทริปที่เคยไป</Text>
                 <ScrollView
                 horizontal={true}
                 showsHorizontalScrollIndicator={false}
                 >
                    {user.pastTrips.map((textWithImage,index)=>(
                        <ImageBackground source={{uri:textWithImage.fileUrl}} style={{width:330,height:220,borderRadius:7}}>
                             <View style={{backgroundColor:'#FFFFFF',position:'absolute',bottom:20,left:10,right:10}}>
                                <Text>{textWithImage.description}</Text>
                             </View>
                        </ImageBackground>
                    ))}

                 </ScrollView>
                 <Text>รีวิวจากผู้ใช้อื่น</Text>
                  <View style={{alignItems:'center'}}>
          <View style={{ alignItems: 'center' }}>
  <Text>{averageRating.toFixed(1)}</Text>

<View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent =
          averageRating >= star
            ? 100
            : averageRating >= star - 1
            ? (averageRating - (star - 1)) * 100
            : 0;

        return (
          <View key={star} style={{  position: 'relative',
    width: 24,
    height: 24,
    marginRight: 4,}}>
            {/* Empty (gray) star as background */}
            <Ionicons name="star" size={24} color="#F3F4F6" />

            {/* Filled (yellow) part overlaid */}
            {fillPercent > 0 && (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    width: `${fillPercent}%`,
                    overflow: 'hidden',
                  },
                ]}
              >
                <Ionicons name="star" size={24} color="#FACC15" />
              </View>
            )}
          </View>
        );
      })}
    </View>
</View>
                  </View>
                  <Text>เรตติ้ง</Text>
                  <View style={{flexDirection:'row'}}>
                    <Text>5</Text>
                      <LinearGradient
  colors={['#585DDB','#FF956E']}
  start={{x:0,y:0}}
  end={{x:1,y:0}}
  style={{flex:1}}
  />   
                  </View>
                            <View style={{flexDirection:'row'}}>
                    <Text>4</Text>
                      <LinearGradient
  colors={['#585DDB','#FF956E']}
  start={{x:0,y:0}}
  end={{x:1,y:0}}
  style={{flex:1}}
  />   
                  </View>
<View>
                                <View style={{flexDirection:'row'}}>
                    <Text>3</Text>
                      <LinearGradient
  colors={['#585DDB','#FF956E']}
  start={{x:0,y:0}}
  end={{x:1,y:0}}
  style={{flex:1}}
  />   
                  </View>
                            <View style={{flexDirection:'row'}}>
                    <Text>2</Text>
                      <LinearGradient
  colors={['#585DDB','#FF956E']}
  start={{x:0,y:0}}
  end={{x:1,y:0}}
  style={{flex:1}}
  />   
                  </View>
                            <View style={{flexDirection:'row'}}>
                    <Text>1</Text>
                      <LinearGradient
  colors={['#585DDB','#FF956E']}
  start={{x:0,y:0}}
  end={{x:0.2,y:0}}
  style={{flex:1}}
  />   
                  </View>
                  <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  >


                  </ScrollView>
</View>
            </ScrollView>
    </SafeAreaView>
  </LinearGradient>
   )
}

export default PF_104
import {Image,View,Text,ScrollView,TouchableOpacity,SafeAreaView,ImageBackground} from 'react-native'
import {use, useEffect,useState} from 'react'
import React from 'react'
import {useLocalSearchParams,useRouter,Stack, router} from  'expo-router'
import {fetchUserTravelProperties} from '../../features/user/services/userServices'
import {fetchReviewers} from '../../features/user/services/user_reviews'
import  {LinearGradient} from 'expo-linear-gradient'
import {Ionicons} from '@expo/vector-icons'
interface User {
  userId: string;
  fullname: string;
  nickname: string;
  email: string;
  gender: string;
  age: number;
  phoneNumber: string;
  occupation: string;
  facebookUrl: string;
  lineId: string;
  portraitImageUrl: string;
  profileImageUrl: string;
  idCardImageUrl: string;
  destinations: string[];
  travelStyles: string[];
  travelPersonalities: string[];
  transportationStyles: string[];
  reviews: {
    comment: string;
    rating: number;
    tripId: string;
    userId: string;
  }[];
  pastTrips: {
    description: string;
    fileUrl: string;
  }[];
}
interface TravelItem {
  id: string
  title: string
}
function safeParse<T>(value: string | undefined): T | null {
  try {
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    console.warn('Invalid JSON:', error);
    return null;
  }
}
function normalizeParam(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) return param[0];
  return param;
}
const PF_106:React.FC=()=>{
const { targetUser,tripId } = useLocalSearchParams()
const trip_Id=tripId? JSON.parse(tripId as string):null;
const normalizedTargetUser = normalizeParam(targetUser);
const user = safeParse<User>(normalizedTargetUser);
const [travelStyles, setTravelStyles] = useState<string[]>([])
const [travelPersonalities, setTravelPersonalities] = useState<string[]>([])
const [transportationStyles, setTransportationStyles] = useState<string[]>([])



const [reviewerData, setReviewerData] = useState(null);


useEffect(() => {
  const fetchData = async () => {
    if (user?.userId) {
      try {
        const response = await fetchUserTravelProperties(user.userId)
        if (response) {
          setTravelStyles(response.travelStyles?.map((item: TravelItem) => item.title))
          setTravelPersonalities(response.travelPersonalities?.map((item: TravelItem) => item.title))
          setTransportationStyles(response.transportation?.map((item: TravelItem) => item.title))
        }
      } catch (error) {
        console.error('Error fetching travel properties:', error)
      }
    }
  }

  const handleFetchReviewers = async () => {
    const reviewersData = await fetchReviewers(user?.userId as string);
    
    if (reviewersData) {
      setReviewerData(reviewersData); // Store the data in state
      console.log("Reviewers:", reviewersData.reviewers);
      console.log("Rating Stats:", reviewersData.ratingStats);
    }
  }

  handleFetchReviewers()
  fetchData()
}, [user?.userId])

 const averageRating = user.reviews?.length > 0
  ? user.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length
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
          <TouchableOpacity onPress={()=>router.push('/findTrips')} style={{position:'absolute',top:40,left:50}}>
                  <Image source={require('../assets/images/home-back.png')} style={{height:24,width:24}}/>
          </TouchableOpacity>
            <View style={{zIndex:2,position:'absolute',backgroundColor:'#FFFFFF',borderRadius:20,top:77,padding:20,minWidth:330}}>
                  <View style={{flexDirection:'row',alignItems:'center'}}>
                        {user.profileImageUrl ?(
                            <Image source={{uri:user.profileImageUrl}} style={{height:90,width:90,borderRadius:20,borderWidth:0}}/>
                        ):<Image source={require('../assets/images/default.jpeg')} style={{height:90,width:90,borderRadius:20,borderWidth:0}}/>}
                        <View>
                           <View style={{flexDirection:'row',alignItems: 'baseline',justifyContent:'center', }}>
                            <Text style={{fontFamily:'LineSeedSansTH_A_Bd',color:'#374151',fontSize:18,fontWeight:'700',marginHorizontal:15}}>{user.fullname}</Text>
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

            <ScrollView style={{flex:1,position:'absolute',top:150,backgroundColor:'red',paddingTop:100,width:'100%',zIndex:1,borderTopLeftRadius:80,borderTopRightRadius:80}}>
                <Text>Bio</Text>
                <Text>🧳 ชอบเที่ยวธรรมชาติ เดินป่า ชิวคาเฟ่ ถ่ายรูป 📸</Text>
                 <Text style={{}}>ความสนใจ</Text>
               <View style={{flexDirection:'row',backgroundColor:'#FFFFFF'}}>
               
                {travelStyles?.map((style,index)=>(
                    <View key={index} style={{backgroundColor:'#F3F4F6',borderRadius:100,marginRight:20,paddingVertical:5,paddingHorizontal:15}}>
                        <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:10}}>{style}</Text>
                         </View>
                ))}
               </View>
                  <Text>สไตล์การเดินทาง</Text>
                  <Text>เป้าหมายท่องเที่ยว</Text>
                  <View style={{flexDirection:'row',backgroundColor:'#FFFFFF'}}>
               
                {user.destinations?.map((destination,index)=>(
                    <View key={index} style={{backgroundColor:'#F3F4F6',borderRadius:100,marginRight:20,paddingVertical:5,paddingHorizontal:15}}>
                        <Text style={{color:'#374151',fontFamily:'LineSeedSansTH_A_Bd',fontWeight:'700',fontSize:10}}>{destination}</Text>
                         </View>
                ))}
               </View>
                <Text>ประเภทท่องเที่ยว</Text>
                  <View style={{flexDirection:'row',backgroundColor:'#FFFFFF'}}>
               
                {travelPersonalities?.map((style,index)=>(
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
                    {user.pastTrips?.map((textWithImage,index)=>(
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
    {[1, 2, 3, 4, 5].map((star) => (
      <Ionicons 
        key={star}
        name='star' 
        style={{
          color: star <= averageRating ? '#FACC15' : '#F3F4F6',
          height: 30,
          width: 33.75
        }}
      />
    ))}
  </View>
</View>
                  </View>
<Text>เรตติ้ง</Text>
{(() => {
  // Use reviewerData if available, otherwise create default empty stats
  const stats = reviewerData?.ratingStats || {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    totalReviews: 0,
    averageRating: 0
  };
  
  const maxCount = Math.max(stats[1], stats[2], stats[3], stats[4], stats[5]);
  const hasReviews = maxCount > 0;
  
  return [5, 4, 3, 2, 1].map((rating) => {
    const count = stats[rating];
    const percentage = hasReviews ? count / maxCount : 0;
    
    return (
      <View key={rating} style={{flexDirection:'row', alignItems: 'center', marginVertical: 2}}>
        <Text style={{width: 20, textAlign: 'center'}}>{rating}</Text>
        <View style={{flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, marginHorizontal: 10}}>
          <LinearGradient
            colors={['#585DDB','#FF956E']}
            start={{x:0,y:0}}
            end={{x:1,y:0}}
            style={{
              height: '100%',
              width: `${percentage * 100}%`,
              borderRadius: 4
            }}
          />
        </View>
        <Text style={{width: 30, textAlign: 'center'}}>{count}</Text>
      </View>
    );
  });
})()}


<View>


   
               <ScrollView
  horizontal={true}
  showsHorizontalScrollIndicator={false}
  style={{marginTop: 10}}
>
  {reviewerData?.reviewers && reviewerData.reviewers.length > 0 ? (
    reviewerData.reviewers.map((reviewer, index) => (
      <View key={index} style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginRight: 10,
        width: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
          {reviewer.profileImageUrl ? (
            <Image 
              source={{uri: reviewer.profileImageUrl}} 
              style={{height: 40, width: 40, borderRadius: 20}}
            />
          ) : (
            <Image 
              source={require('../assets/images/default.jpeg')} 
              style={{height: 40, width: 40, borderRadius: 20}}
            />
          )}
          <View style={{marginLeft: 10, flex: 1}}>
            <Text style={{fontWeight: 'bold', fontSize: 14}}>{reviewer.fullname}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star}
                  name='star' 
                  style={{
                    color: star <= reviewer.rating ? '#FACC15' : '#F3F4F6',
                    fontSize: 14
                  }}
                />
              ))}
            </View>
          </View>
        </View>
        <Text style={{fontSize: 12, color: '#666'}}>{reviewer.comment}</Text>
      </View>
    ))
  ) : (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      width: 300,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <Ionicons name="star-outline" size={40} color="#D1D5DB" />
      <Text style={{
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 10,
        fontFamily: 'LineSeedSansTH_A_Bd'
      }}>
        ยังไม่มีรีวิว
      </Text>
      <Text style={{
        fontSize: 12,
        color: '#D1D5DB',
        textAlign: 'center',
        marginTop: 5
      }}>
        เป็นคนแรกที่รีวิวผู้ใช้คนนี้
      </Text>
    </View>
  )}
</ScrollView>
</View>
          <View style={{ flex: 1, justifyContent: 'flex-end', zIndex: 0,width:'100%',backgroundColor:'#FFFFFF' }}>
  <TouchableOpacity
    style={{
      backgroundColor: '#585DDB',
      height: 45,
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 20,
      width:'90%'
    }}
    onPress={
      
      ()=>{
         console.log(tripId);
         console.log(user.userId);
         
        router.push(`/Review?id=${user?.id}&tripId=${trip_Id}`)}}
  >
    <Text style={{
      color: '#FFFFFF',
      fontFamily: 'LineSeedSansTH_A_Bd',
      fontWeight: '700',
      fontSize: 12
    }}>
      รีวิวผู้ใช้คนนี้
    </Text>
  </TouchableOpacity>
</View>
            </ScrollView>


    </SafeAreaView>
  </LinearGradient>
   )
}

export default PF_106
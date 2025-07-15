import React from 'react'
import {Text,View,SafeAreaView,TouchableOpacity,} from 'react-native'
import {useRouter,Stack} from 'expo-router'
import {FontAwesome} from '@expo/vector-icons'
const PrivacyPolicy:React.FC=()=>{


    const router=useRouter()
    return (
     <SafeAreaView style={{    flex: 1,backgroundColor: '#fff',}}>
        <Stack.Screen options={{headerShown:false}}/>
          <View style={{  flexDirection: 'row',
    alignItems: 'center',
    paddingTop:35,
    paddingBottom:25,
    paddingHorizontal: 16,borderBottomColor:'#0000001A',borderBottomWidth:1,boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.09)',backgroundColor:'#FFFFFF'}}>
          <TouchableOpacity onPress={()=>router.push('/login')} style={{  marginRight: 12,padding: 10,flex:0.4}}>
            <FontAwesome name='angle-left' color="#000000" size={26}/>
          </TouchableOpacity>
          <Text style={{color:'#374151',fontSize:16,fontFamily:'LineSeedSansTH_A_Bd'}}>Privacy Policy</Text>
        </View>
        <View style={{marginTop:20,paddingHorizontal:20}}>
            <Text style={{fontSize:14,fontFamily:'LineSeedSansTH'}}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam lacus ligula, lobortis ut consequat dapibus, condimentum rhoncus metus. Sed pulvinar, odio nec vulputate pellentesque, augue nibh congue quam, quis elementum sem nibh eget ipsum. Duis sed magna risus.
            </Text>
          <View style={{marginTop:20,paddingHorizontal:10}}>
     <Text style={{fontFamily:'LineSeedSansTH',fontSize:14,color:'#000000'}}><Text style={{ fontSize: 20 }}>{'\u2022'}</Text> Lorem ipsum dolor sit amet, consectetur</Text>
     <Text style={{fontFamily:'LineSeedSansTH',fontSize:14,color:'#000000'}}><Text style={{ fontSize: 20 }}>{'\u2022'}</Text> Phasellus a nunc imperdiet, porta nunc non.</Text>
     <Text style={{fontFamily:'LineSeedSansTH',fontSize:14,color:'#000000'}}><Text style={{ fontSize: 20 }}>{'\u2022'}</Text> Pellentesque sagittis nibh id ultricies blandit.</Text>
     <Text style={{fontFamily:'LineSeedSansTH',fontSize:14,color:'#000000'}}><Text style={{ fontSize: 20 }}>{'\u2022'}</Text> Donec auctor mauris vitae urna aliquet.</Text>
     <Text style={{fontFamily:'LineSeedSansTH',fontSize:14,color:'#000000'}}><Text style={{ fontSize: 20 }}>{'\u2022'}</Text> Donec mattis nisl vitae est vulputate feugiat.</Text>
</View>

        </View>
     </SafeAreaView>
          
    )
}

export default PrivacyPolicy

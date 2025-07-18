import { getUserProfile, fetchTravelStyles, transportationStyles } from '../../features/user/services/userServices'
import { View, Image, SafeAreaView, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native'
import BottomNavigation from '../../components/customNavigation'
import { Stack, useRouter, useLocalSearchParams, router } from 'expo-router'
import React, { useEffect, useState } from 'react'

const UserProfile = () => {
  const params = useLocalSearchParams();
  const userId = params.userId;
  
  // State based on your API response structure
  const [profileData, setProfileData] = useState(null);
  const [travelStylesData, setTravelStylesData] = useState([]);
  const [transportationStylesData, setTransportationStylesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [profileResult, travelStylesResult, transportationStylesResult] = await Promise.all([
          getUserProfile(userId),
          fetchTravelStyles(),
          transportationStyles()
        ]);
        
        if (profileResult) {
          setProfileData(profileResult);
        } else {
          setError('User profile not found');
        }
        
        setTravelStylesData(travelStylesResult || []);
        setTransportationStylesData(transportationStylesResult || []);
        
      } catch (err) {
        setError('Failed to fetch profile');
        console.error('Error in fetchProfile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Helper function to get travel style details from IDs
  const getTravelStyleDetails = (styleIds) => {
    if (!styleIds || !Array.isArray(styleIds)) return [];
    
    // Debug logging
    console.log('User selected travel style IDs:', styleIds);
    console.log('Available travel styles:', travelStylesData);
    
    return styleIds.map(userSelectedId => {
      // Try to find matching style with flexible comparison
      const style = travelStylesData.find(item => {
        // Convert both to strings for comparison
        const itemId = String(item.id);
        const selectedId = String(userSelectedId);
        return itemId === selectedId;
      });
      
      console.log(`Looking for ID: ${userSelectedId}, Found:`, style);
      return style ? style : { id: userSelectedId, title: `${userSelectedId}` };
    });
  };

  // Helper function to get transportation style details from IDs
  const getTransportationStyleDetails = (styleIds) => {
    if (!styleIds || !Array.isArray(styleIds)) return [];
    
    // Debug logging
    console.log('User selected transportation style IDs:', styleIds);
    console.log('Available transportation styles:', transportationStylesData);
    
    return styleIds.map(userSelectedId => {
      // Try to find matching style with flexible comparison
      const style = transportationStylesData.find(item => {
        // Convert both to strings for comparison
        const itemId = String(item.id);
        const selectedId = String(userSelectedId);
        return itemId === selectedId;
      });
      
      console.log(`Looking for transportation ID: ${userSelectedId}, Found:`, style);
      return style ? style : { id: userSelectedId, title: `Unknown Transportation (${userSelectedId})` };
    });
  };

  if (loading || !travelStylesData.length || !transportationStylesData.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text>Loading...</Text>
        </View>
        <BottomNavigation currentScreen="profile" userId={userId} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text>Error: {error}</Text>
        </View>
        <BottomNavigation currentScreen="profile" userId={userId} />
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text>No profile data available</Text>
        </View>
        <BottomNavigation currentScreen="profile" userId={userId} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scrollView}>
        {/* Profile Image */}
    {profileData.profileImageUrl && (
  <View style={styles.imageWrapper}>
    <Image 
      source={{ uri: profileData.profileImageUrl }} 
      style={styles.profileImage}
    />
    <TouchableOpacity style={styles.editProfile} onPress={()=>router.push(`/profile?userId=${userId}`)}>
 <Image source={require('../assets/images/edit-profile.png')} style={{height:20,width:20}}/>
    </TouchableOpacity>
    <TouchableOpacity style={styles.threedots}>
 <Image source={require('../assets/images/3-dots.png')} style={{height:24,width:24}}/>
    </TouchableOpacity>
     <TouchableOpacity style={styles.facebook}>
 <Image source={require('../assets/images/facebook.png')} style={{height:24,width:24}}/>
    </TouchableOpacity>
        <TouchableOpacity style={styles.instagram}>
 <Image source={require('../assets/images/instagram.png')} style={{height:24,width:24}}/>
    </TouchableOpacity>
    <Text style={styles.nameOnImage}>{profileData.fullname}</Text>
   
  </View>
)}


        {/* Basic Info 
        <View style={styles.section}>
          <Text style={styles.name}>{profileData.fullname}</Text>
          <Text style={styles.nickname}>"{profileData.nickname}"</Text>
          <Text style={styles.info}>Age: {profileData.age}</Text>
          <Text style={styles.info}>Gender: {profileData.gender}</Text>
          <Text style={styles.info}>Phone: {profileData.phoneNumber}</Text>
          <Text style={styles.info}>Email: {profileData.email}</Text>
        </View>*/}

        {/* Destinations 
        {profileData.destinations && profileData.destinations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destinations</Text>
            {profileData.destinations.map((destination, index) => (
              <Text key={index} style={styles.listItem}>• {destination}</Text>
            ))}
          </View>
        )}*/}

        {/* Travel Styles */}
     {profileData.travelStyles && profileData.travelStyles.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>ความสนใจ</Text>

    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {getTravelStyleDetails(profileData.travelStyles).map((style, index) => (
        <View key={index} style={styles.travelStyleCard}>
          {style.iconImageUrl && (
            <Image source={{ uri: style.iconImageUrl }} style={styles.styleIcon} />
          )}
          <Text style={styles.styleTitle}>{style.title}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
)}


        {/* Transportation Styles */}
    {profileData.transportationStyles && profileData.transportationStyles.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>สไตล์การเดินทาง</Text>

    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {getTransportationStyleDetails(profileData.transportationStyles).map((transport, index) => (
        <View key={index} style={styles.transportTag}>
          <Text style={styles.transportTagText}>{transport.title}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
)}


      {/* Past Trips */}
{profileData.pastTrips && profileData.pastTrips.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>ทริปที่เคยไป</Text>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {profileData.pastTrips.map((trip, index) => (
        <View key={index} style={styles.tripItem}>
          <Image source={{ uri: trip.fileUrl }} style={styles.tripImage} />
          {/*<Text style={styles.tripDescription}>{trip.description}</Text>*/}
        </View>
      ))}
    </ScrollView>
  </View>
)}

      </ScrollView>
      <BottomNavigation currentScreen="profile" userId={userId} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:40,
    borderRadius:5
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 350,
    height: 350,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
section: {
  marginBottom: 24,
},
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  nickname: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  listItem: {
    fontSize: 16,
    marginBottom: 4,
    marginLeft: 8,
  },
tripItem: {
  width: 90, // set a fixed width for horizontal layout
  marginRight: 16, // space between items
  borderBottomWidth: 0, // remove vertical-style border
},
tripImage: {
  width: 90,
  height: 60,
  borderRadius: 8,
  marginBottom: 8,
},
transportTag: {
  backgroundColor: '#eee',
  borderRadius: 20,
  paddingVertical: 6,
  paddingHorizontal: 12,
  marginRight: 10,
  marginBottom: 8,
  alignSelf: 'flex-start',
},
travelStyleCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f2f2f2',
  borderRadius: 16,
  paddingVertical: 8,
  paddingHorizontal: 12,
  marginRight: 10,
  marginBottom: 8,
},

transportTagText: {
  fontSize: 14,
  color: '#333',
},

  tripDescription: {
    fontSize: 16,
    color: '#666',
  },
  styleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  styleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  imageWrapper: {
  position: 'relative',
  width: 350,
  height: 350,
  alignSelf: 'center',
  marginBottom: 24,
},

nameOnImage: {
  position: 'absolute',
  bottom: 16,
  left: 16,    // add some padding from the left edge
  right: 'auto', // let it size naturally, no right constraint
  textAlign: 'left',
  color: 'white',
  fontSize: 24,
  fontWeight: 'bold',
  textShadowColor: 'rgba(0, 0, 0, 0.7)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
},
editProfile:{
  position: 'absolute',
  top:20,
  bottom: 'auto',
  left: 16,    // add some padding from the left edge
  right: 'auto', // let it size naturally, no right constraint
  padding:8,
  backgroundColor:'#9CA3AF',
  borderRadius:9999,
  height:35,
  width:35
},
threedots:{
  position: 'absolute',
  top:20,
  bottom: 'auto',
  right:16,
  left:'auto',
  padding:5,
  backgroundColor:'#9CA3AF',
  borderRadius:9999,
  height:35,
  width:35
},
facebook:{
 position: 'absolute',
  top:60,
  bottom: 'auto',
  right:16,
  left:'auto',
  padding:5,
  backgroundColor:'#FFFFFF',
  borderRadius:9999,
  height:35,
  width:35
},
instagram:{
 position: 'absolute',
  top:100,
  bottom: 'auto',
  right:16,
  left:'auto',
  padding:5,
  backgroundColor:'#FFFFFF',
  borderRadius:9999,
  height:35,
  width:35
},

  styleTitle: {
    fontSize: 16,
    flex: 1,
  },
});

export default UserProfile;
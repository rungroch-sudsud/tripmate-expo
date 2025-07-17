import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet,SafeAreaView,Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {FloatingActionButton} from './FloatingActionButton'

const BottomNavigation = ({ currentScreen, userId }) => {
  const router = useRouter();

  const handleNavigation = (screen) => {
    switch (screen) {
      case 'findTrips':
        router.push('/findTrips');
        break;
      case 'savedTrips':
        router.push('/savedTrips');
        break;
      case 'channel':
       // router.push('/channel');
        break;
      case 'profile':
        router.push(`/profile?userId=${userId}`);
        break;
    }
  };



 const getHomeIconStyle = (screen) => {
    return currentScreen === screen 
      ? [styles.navHomeIcon, { tintColor: '#585DDB' }] 
      : styles.navHomeIcon;
  };

   const getSaveIconStyle = (screen) => {
    return currentScreen === screen 
      ? [styles.navSaveIcon, { tintColor: '#585DDB' }] 
      : styles.navSaveIcon;
  };
    const getMessageIconStyle = (screen) => {
    return currentScreen === screen 
      ? [styles.navMessageIcon, { tintColor: '#585DDB' }] 
      : styles.navMessageIcon;
  };
     const getProfileIconStyle = (screen) => {
    return currentScreen === screen 
      ? [styles.navProfileIcon, { tintColor: '#585DDB' }] 
      : styles.navProfileIcon;
  };



  const getTextStyle = (screen) => {
    return currentScreen === screen 
      ? [styles.navText, { color: '#585DDB', fontFamily: 'LineSeedSansTH_A_Bd' }] 
      : styles.navText;
  };

 const webShadowStyle = Platform.OS === 'web' ? { boxShadow: '0px -4px 12px rgba(0, 0, 0, 0.1)' } : {};


  return (
<SafeAreaView style={{  backgroundColor: '#FFFFFF',}}>
      <View style={[styles.bottomNav, webShadowStyle]}>

      <FloatingActionButton onPress={() => router.push('/createTrip')} />

      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handleNavigation('findTrips')}
      >
        <Image
          source={require('../app/assets/images/images/images/image18.png')}
          style={getHomeIconStyle('findTrips')}
        />
        <Text style={getTextStyle('findTrips')}>หน้าหลัก</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem,{marginRight:90}]} 
        onPress={() => handleNavigation('savedTrips')}
      >
        <Image
          source={require('../app/assets/images/saved.png')}
          style={getSaveIconStyle('savedTrips')}
        />
        <Text style={getTextStyle('savedTrips')}>บันทึก</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handleNavigation('channel')}
      >
        <Image
          source={require('../app/assets/images/message-icon.png')}
          style={getMessageIconStyle('channel')}
        />
        <Text style={getTextStyle('channel')}>แชท</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handleNavigation('profile')}
      >
        <Image
          source={require('../app/assets/images/profile-icon.png')}
          style={getProfileIconStyle('profile')}
        />
        <Text style={getTextStyle('profile')}>โปรไฟล์</Text>
      </TouchableOpacity>
    </View>
</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 30,
    paddingBottom: 30,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50
  },
  navItem: {
    alignItems: 'center',
  },
  navHomeIcon: {
    width: 27,
    height: 24,
    marginBottom: 10,
    resizeMode: 'contain', 
  },
 navSaveIcon: {
    width: 18,
    height: 23,
    marginBottom: 10,
    resizeMode: 'contain', 
  },
   navMessageIcon: {
    width: 32,
    height: 32,
    marginBottom: 10,
    resizeMode: 'contain', 
  },
  navProfileIcon:{
    width: 35,
    height: 35,
    marginBottom: 10,
    resizeMode: 'contain', 
  },

  navText: {
    fontSize: 12,
    fontFamily: 'LineSeedSansTH_A_Bd',
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default BottomNavigation;
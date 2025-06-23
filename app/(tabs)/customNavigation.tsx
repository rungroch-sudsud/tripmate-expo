import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {useFonts} from 'expo-font'
const BottomNavigation = ({ currentScreen, userId }) => {

    const [fontsLoaded] = useFonts({
        'CustomFont': require('../assets/fonts/InterTight-Black.ttf'),
        'InterTight-SemiBold': require('../assets/fonts/InterTight-SemiBold.ttf'),
        'InterTight-Regular':require('../assets/fonts/InterTight-Regular.ttf')
      });
  const router = useRouter();

  const handleNavigation = (screen) => {
    switch (screen) {
      //case 'home':
       // router.push('/home'); // or whatever your home route is
       // break;
      case 'findTrips':
        router.push('/findTrips');
        break;
      case 'savedTrips':
        router.push('/savedTrips');
        break;
      case 'profile':
        router.push(`/profile?userId=${userId}`);
        break;
    }
  };

  const getIconStyle = (screen) => {
    return currentScreen === screen 
      ? [styles.navIcon, { tintColor: '#29C4AF' }] 
      : styles.navIcon;
  };

  const getTextStyle = (screen) => {
    return currentScreen === screen 
      ? [styles.navText, { color: '#29C4AF',fontFamily:'InterTight-Regular' }] 
      : styles.navText;
  };

  const getSavedIconStyle = () => {
    return currentScreen === 'savedTrips' 
      ? [styles.savedIcon, { tintColor: '#29C4AF' }] 
      : styles.savedIcon;
  };

  return (
    <View style={styles.bottomNav}>
      {/* Home */}
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handleNavigation('home')}
      >
        <Image
          source={require('../assets/images/images/images/image18.png')}
          style={getIconStyle('home')}
        />
        <Text style={getTextStyle('home')}>หน้าหลัก</Text>
      </TouchableOpacity>

      {/* Find Trips */}
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handleNavigation('findTrips')}
      >
        <Image
          source={require('../assets/images/images/images/image23.png')}
          style={getIconStyle('findTrips')}
        />
        <Text style={getTextStyle('findTrips')}>ค้นหา</Text>
      </TouchableOpacity>

      {/* Saved Trips */}
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handleNavigation('savedTrips')}
      >
        <Image
          source={require('../assets/images/images/images/image21.png')}
          style={getSavedIconStyle()}
        />
        <Text style={getTextStyle('savedTrips')}>บันทึก</Text>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={() => handleNavigation('profile')}
      >
        <Image
          source={require('../assets/images/images/images/image20.png')}
          style={getIconStyle('profile')}
        />
        <Text style={getTextStyle('profile')}>โปรไฟล์</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 10,
  },
  savedIcon: {
    height: 20,
    width: 15,
    marginBottom: 10,
  },
  navText: {
    fontSize: 12,
    fontFamily: 'InterTight-Regular',
    color: '#6B7280',
    alignItems: 'baseline',
  },
});

export default BottomNavigation;
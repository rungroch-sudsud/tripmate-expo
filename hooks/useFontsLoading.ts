import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  Inter_300Light: require('../../assets/fonts/Inter-Light.ttf'),
  Inter_400Regular: require('../../assets/fonts/Inter-Regular.ttf'),
  Inter_500Medium: require('../../assets/fonts/Inter-Medium.ttf'),
  Inter_600SemiBold: require('../../assets/fonts/Inter-SemiBold.ttf'),
  Inter_700Bold: require('../../assets/fonts/Inter-Bold.ttf'),
  Inter_900Black: require('../../assets/fonts/Inter-Black.ttf'),
});

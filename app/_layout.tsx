import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/shared/hooks/useColorScheme';

export {

  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {

  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Original font
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
    CustomFont: require('./assets/fonts/InterTight-Black.ttf'),
    'InterTight-SemiBold': require('./assets/fonts/InterTight-SemiBold.ttf'),
    'InterTight-Regular': require('./assets/fonts/InterTight-Regular.ttf'),
'LineSeedSans': require('./assets/fonts/LINESeedSans_A_Rg.ttf'),
'LineSeedSansTH': require('./assets/fonts/LINESeedSansTH_A_Rg.ttf'),
'LineSeedSansTH_A_XBd':require('./assets/fonts/LINESeedSansTH_A_XBd.ttf'),
'LineSeedSansTH_A_Bd':require('./assets/fonts/LINESeedSansTH_A_Bd.ttf'),
'LineSeedSansTH_A_Th':require('./assets/fonts/LINESeedSansTH_A_Th.ttf'),
'LineSeedSansTH_A_He':require('./assets/fonts/LINESeedSansTH_A_XBd.ttf'),



    // FontAwesome icons
    ...FontAwesome.font,
  });


  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
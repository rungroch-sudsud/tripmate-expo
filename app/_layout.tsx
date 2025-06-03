import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    InterTightRegular: require('../assets/fonts/InterTight-Regular.ttf'),
    InterTightBold: require('../assets/fonts/InterTight-Bold.ttf'),
    InterTightItalic: require('../assets/fonts/InterTight-Italic.ttf'),
    InterTightBoldItalic: require('../assets/fonts/InterTight-BoldItalic.ttf'),
    InterTightMedium: require('../assets/fonts/InterTight-Medium.ttf'),
    InterTightLight: require('../assets/fonts/InterTight-Light.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

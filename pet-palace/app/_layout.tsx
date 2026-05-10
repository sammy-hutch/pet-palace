import { Stack } from "expo-router";
import { DatabaseProvider } from "../src/database/DatabaseContext";
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
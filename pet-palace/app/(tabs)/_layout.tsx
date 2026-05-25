import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import HeaderStats from '../../src/components/HeaderStats';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#25292e' }} edges={['top']}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#9e0585',
          tabBarInactiveTintColor: '#404040',
          tabBarStyle: {
            backgroundColor: '#76cb65',
            borderTopWidth: 0,
          },
          header: () => <HeaderStats />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="palace"
          options={{
            title: 'Palace',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'paw-sharp' : 'paw-outline'} color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="logbook"
          options={{
            title: 'Logbook',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'book-sharp' : 'book-outline'} color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'basket-sharp' : 'basket-outline'} color={color} size={24} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

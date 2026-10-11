import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import PostCreateScreen from '../screens/PostCreateScreen';
import PostEditScreen from '../screens/PostEditScreen';

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f766e', // Teal modern untuk financial theme
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Dipdut Money 💰' }}
      />
      <Stack.Screen
        name="PostCreateScreen"
        component={PostCreateScreen}
        options={{ title: 'Catat Transaksi Baru' }}
      />
      <Stack.Screen
        name="PostEditScreen"
        component={PostEditScreen}
        options={{ title: 'Edit Transaksi' }}
      />
    </Stack.Navigator>
  );
}

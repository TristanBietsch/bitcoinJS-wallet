import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import PinEntryScreen from './PinEntryScreen';
// Import other screens...

const Stack = createStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="PinEntry" component={PinEntryScreen} />
            {/* Add other screens here */}
        </Stack.Navigator>
    );
};

export default AuthNavigator; 
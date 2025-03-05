import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './WelcomeScreen';
import ImportWalletScreen from './ImportWalletScreen';
// Import other screens...

const Stack = createStackNavigator();

const OnboardingNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
            {/* Add other screens here */}
        </Stack.Navigator>
    );
};

export default OnboardingNavigator; 
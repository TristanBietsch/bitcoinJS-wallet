import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SendBTCScreen from './SendBTCScreen';
import ReceiveBTCScreen from './ReceiveBTCScreen';
// Import other screens...

const Stack = createStackNavigator();

const PaymentNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="SendBTC" component={SendBTCScreen} />
            <Stack.Screen name="ReceiveBTC" component={ReceiveBTCScreen} />
            {/* Add other screens here */}
        </Stack.Navigator>
    );
};

export default PaymentNavigator; 
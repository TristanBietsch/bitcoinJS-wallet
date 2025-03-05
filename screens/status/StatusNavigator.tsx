import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SuccessScreen from './SuccessScreen';
import ErrorScreen from './ErrorScreen';

const Stack = createStackNavigator();

const StatusNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen name="Error" component={ErrorScreen} />
        </Stack.Navigator>
    );
};

export default StatusNavigator; 
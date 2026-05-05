import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../styles/theme';

// Screens
import LandingScreen from '../screens/LandingScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ReaderScreen from '../screens/ReaderScreen';
import BooksScreen from '../screens/BooksScreen';
import ProgressScreen from '../screens/ProgressScreen';
import AboutScreen from '../screens/AboutScreen';
import SupportScreen from '../screens/SupportScreen';
import ContactScreen from '../screens/ContactScreen';
import PricingScreen from '../screens/PricingScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createStackNavigator();

const screenOptions = {
    headerShown: false,
    cardStyle: { backgroundColor: Colors.bgDark },
    gestureEnabled: true,
};

const AuthStack = () => (
    <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Pricing" component={PricingScreen} />
    </Stack.Navigator>
);

const MainStack = () => (
    <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Reader" component={ReaderScreen} />
        <Stack.Screen name="Books" component={BooksScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Pricing" component={PricingScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgDark }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;

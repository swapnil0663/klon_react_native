import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import SplashScreen from '../screens/Auth/SplashScreen';
import SignInScreen from '../screens/Auth/SignIn';
import SignUpScreen from '../screens/Auth/SignUp';
import DashboardScreen from '../screens/Dashboard/Dashboard';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#FFFFFF' },
                gestureEnabled: true,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                transitionSpec: {
                  open: {
                    animation: 'spring',
                    config: {
                      stiffness: 1000,
                      damping: 500,
                      mass: 3,
                      overshootClamping: false,
                      restDisplacementThreshold: 0.01,
                      restSpeedThreshold: 0.01,
                    },
                  },
                  close: {
                    animation: 'spring',
                    config: {
                      stiffness: 1000,
                      damping: 500,
                      mass: 3,
                    },
                  },
                },
            }}
        >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen} 
              options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;

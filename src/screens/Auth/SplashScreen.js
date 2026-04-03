import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { COLORS } from '../../constants/theme';
import { getSession } from '../../services/session';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation, route }) => {
  const fadeAnim = new Animated.Value(0);
  const nextTarget = route.params?.nextTarget;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Navigate after 2.5 seconds
    const timer = setTimeout(async () => {
      if (nextTarget) {
        // If a target is specifically passed (e.g., from Login), go there
        navigation.replace(nextTarget);
      } else {
        // Standard initial launch: Check session
        const session = await getSession();
        if (session) {
          navigation.replace('Dashboard');
        } else {
          navigation.replace('SignIn');
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Animated.View style={{ 
        flex: 1,
        opacity: fadeAnim,
      }}>
        <Image 
          source={require('../../assets/klon_app_splash.png')} 
          style={styles.splashImage}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  splashImage: {
    width: width,
    height: height,
  },
});

export default SplashScreen;

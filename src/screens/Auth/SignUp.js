import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../constants/theme';
import { Star, ArrowLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('SignIn');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={COLORS.white} size={32} />
        </TouchableOpacity>

        <View style={styles.header}>
            <Image 
              source={require('../../assets/klon_logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
           <Text style={styles.title}>Join the Team!</Text>
           <Text style={styles.subtitle}>Let's create your superhero profile</Text>
        </View>

        <View style={styles.form}>
           <View style={[styles.inputContainer, { borderColor: COLORS.sky }]}>
            <TextInput
              style={styles.input}
              placeholder="Your Character Name"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={[styles.inputContainer, { borderColor: COLORS.secondary }]}>
            <TextInput
              style={styles.input}
              placeholder="Your Email"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, { borderColor: COLORS.candy }]}>
            <TextInput
              style={styles.input}
              placeholder="Your Magical Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <View style={styles.buttonTextRow}>
                <Text style={styles.buttonText}>Finish Character!</Text>
                <Star color={COLORS.white} size={24} fill={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.footerText}>
              Already a Hero? <Text style={styles.highlightText}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    padding: SIZES.padding * 1.5,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 1,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.45,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  form: {
    gap: 15,
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 20,
    height: 64,
    borderWidth: 2,
    justifyContent: 'center',
  },
  input: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '500',
  },
  button: {
    backgroundColor: COLORS.secondary,
    height: 72,
    borderRadius: SIZES.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  buttonTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  footerLink: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  highlightText: {
    color: COLORS.sunny,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;

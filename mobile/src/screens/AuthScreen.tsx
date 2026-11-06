import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen = () => {
  const { login } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Branding */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Durcheap</Text>
          <Text style={styles.tagline}>Your marketplace for everything</Text>
        </View>

        {/* Sign In Options */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInTitle}>Sign in to your account</Text>
          
          <TouchableOpacity style={styles.signInButton} onPress={login}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.signInButtonText}>Sign In with Replit</Text>
          </TouchableOpacity>

          <Text style={styles.benefitsTitle}>Benefits of signing in:</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="bag-outline" size={16} color="#666" />
              <Text style={styles.benefitText}>Save items in your cart</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="heart-outline" size={16} color="#666" />
              <Text style={styles.benefitText}>Create wishlists</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="receipt-outline" size={16} color="#666" />
              <Text style={styles.benefitText}>Track your orders</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="storefront-outline" size={16} color="#666" />
              <Text style={styles.benefitText}>Become a seller</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#232F3E',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  signInContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signInTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#232F3E',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9900',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232F3E',
    marginBottom: 12,
  },
  benefitsList: {
    space: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default AuthScreen;
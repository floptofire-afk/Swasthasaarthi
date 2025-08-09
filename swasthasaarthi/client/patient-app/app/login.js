// app/login.js - Login screen with Firebase phone authentication
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Title, TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Send OTP to phone number
  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For demo purposes, we'll simulate OTP sending
      // In a real app, you would use Firebase Phone Auth
      setVerificationId('demo-verification-id');
      Alert.alert('OTP Sent', 'For demo purposes, use OTP: 123456');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and sign in
  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For demo purposes, accept OTP 123456
      if (otp === '123456') {
        // Simulate successful login
        Alert.alert('Success', 'Login successful!');
        router.replace('/');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>Login</Title>
        
        <TextInput
          label="Mobile Number"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          mode="outlined"
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="Enter 10-digit mobile number"
          disabled={!!verificationId}
        />

        {verificationId && (
          <TextInput
            label="OTP"
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
            mode="outlined"
            keyboardType="number-pad"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
          />
        )}

        {error ? (
          <HelperText type="error" style={styles.error}>
            {error}
          </HelperText>
        ) : null}

        {loading ? (
          <ActivityIndicator
            animating={true}
            size="large"
            style={styles.loader}
          />
        ) : (
          <Button
            mode="contained"
            style={styles.button}
            onPress={verificationId ? verifyOtp : sendOtp}
          >
            {verificationId ? 'Verify OTP & Login' : 'Send OTP'}
          </Button>
        )}

        <Button
          mode="text"
          style={styles.linkButton}
          onPress={() => router.push('/register')}
        >
          New user? Register here
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 16,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    textAlign: 'center',
  },
});
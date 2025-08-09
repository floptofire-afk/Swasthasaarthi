// app/register.js - Registration screen with user data collection and Firebase auth
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Title, TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Validate form fields
  const validateForm = () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!aadhaar || aadhaar.length < 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return false;
    }
    return true;
  };

  // Send OTP to phone number
  const sendOtp = async () => {
    if (!validateForm()) return;

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

  // Verify OTP and create user account
  const verifyOtpAndRegister = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For demo purposes, accept OTP 123456
      if (otp === '123456') {
        // Create a demo user account using email/password (since phone auth needs additional setup)
        const email = `${phone}@demo.com`;
        const password = 'demo123456';
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: name.trim(),
          phone: phone,
          aadhaar: aadhaar,
          role: 'patient',
          createdAt: new Date().toISOString(),
        });

        Alert.alert('Success', 'Registration successful!');
        router.replace('/');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.title}>Register</Title>
        
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          placeholder="Enter your full name"
          disabled={!!verificationId}
        />

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

        <TextInput
          label="Aadhaar Number (Mock)"
          value={aadhaar}
          onChangeText={setAadhaar}
          style={styles.input}
          mode="outlined"
          keyboardType="number-pad"
          maxLength={12}
          placeholder="Enter 12-digit Aadhaar number"
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
            onPress={verificationId ? verifyOtpAndRegister : sendOtp}
          >
            {verificationId ? 'Verify OTP & Register' : 'Send OTP'}
          </Button>
        )}

        <Button
          mode="text"
          style={styles.linkButton}
          onPress={() => router.push('/login')}
        >
          Already have an account? Login here
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
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
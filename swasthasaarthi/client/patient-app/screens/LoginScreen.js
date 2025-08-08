import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, HelperText, ActivityIndicator } from 'react-native-paper';
import firebase from '../firebase';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const confirmation = await firebase.auth().signInWithPhoneNumber('+91' + phone);
      setConfirm(confirmation);
    } catch (e) {
      setError('Failed to send OTP. Please check the number.');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await confirm.confirm(otp);
    } catch (e) {
      setError('Invalid OTP or login failed.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Login</Title>
      <TextInput
        label="Mobile Number"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        mode="outlined"
        keyboardType="phone-pad"
        maxLength={10}
        disabled={!!confirm}
      />
      {confirm && (
        <TextInput
          label="OTP"
          value={otp}
          onChangeText={setOtp}
          style={styles.input}
          mode="outlined"
          keyboardType="number-pad"
          maxLength={6}
        />
      )}
      {error ? <HelperText type="error">{error}</HelperText> : null}
      {loading ? (
        <ActivityIndicator animating size="large" style={{ marginVertical: 16 }} />
      ) : confirm ? (
        <Button mode="contained" onPress={verifyOtp} style={styles.button}>
          Verify OTP & Login
        </Button>
      ) : (
        <Button mode="contained" onPress={sendOtp} style={styles.button}>
          Send OTP
        </Button>
      )}
      <Button mode="text" onPress={() => navigation.navigate('Register')}>
        New user? Register
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  input: {
    width: '90%',
    marginVertical: 8,
  },
  button: {
    width: '90%',
    marginVertical: 12,
    paddingVertical: 8,
  },
});
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title } from 'react-native-paper';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>SwasthaSaarthi</Title>
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.navigate('Register')}
      >
        Register
      </Button>
      <Button
        mode="outlined"
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        Login
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
    fontSize: 32,
    marginBottom: 40,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  button: {
    width: '80%',
    marginVertical: 10,
    paddingVertical: 8,
  },
});
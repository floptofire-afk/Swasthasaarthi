// app/index.js - Dashboard/Home screen with main navigation options
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Button, Paragraph, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function DashboardScreen() {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch user data from Firestore
  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name || 'User');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/welcome');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.greeting}>Welcome, {userName}!</Title>
        
        <View style={styles.cardContainer}>
          <Card style={styles.card} onPress={() => router.push('/book-appointment')}>
            <Card.Content>
              <Title style={styles.cardTitle}>📅 Book Appointment</Title>
              <Paragraph>Schedule your next visit to PHC</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.card} onPress={() => router.push('/prescriptions')}>
            <Card.Content>
              <Title style={styles.cardTitle}>📋 View Prescriptions</Title>
              <Paragraph>Access your medical prescriptions</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.card} onPress={() => router.push('/medicine-history')}>
            <Card.Content>
              <Title style={styles.cardTitle}>💊 Medicine History</Title>
              <Paragraph>Track your medication records</Paragraph>
            </Card.Content>
          </Card>
        </View>

        <Button
          mode="outlined"
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          Logout
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 32,
  },
  cardContainer: {
    flex: 1,
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    fontSize: 18,
    color: '#1976d2',
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
});
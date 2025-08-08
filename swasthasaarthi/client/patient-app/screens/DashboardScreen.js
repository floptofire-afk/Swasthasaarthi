import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title, Text, Card } from 'react-native-paper';
import firebase from '../firebase';

export default function DashboardScreen({ navigation }) {
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchName = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        const doc = await firebase.firestore().collection('users').doc(user.uid).get();
        setName(doc.data()?.name || '');
      }
    };
    fetchName();
  }, []);

  const handleLogout = async () => {
    await firebase.auth().signOut();
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Welcome, {name}</Title>
      <Card style={styles.card} onPress={() => navigation.navigate('BookAppointment')}>
        <Card.Title title="Book Appointment" left={(props) => <Card.Icon {...props} icon="calendar" />} />
      </Card>
      <Card style={styles.card} onPress={() => navigation.navigate('Prescriptions')}>
        <Card.Title title="View Prescriptions" left={(props) => <Card.Icon {...props} icon="file-document" />} />
      </Card>
      <Card style={styles.card} onPress={() => navigation.navigate('MedicineHistory')}>
        <Card.Title title="Medicine History" left={(props) => <Card.Icon {...props} icon="pill" />} />
      </Card>
      <Button mode="outlined" style={styles.logout} onPress={handleLogout}>
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  card: {
    width: '90%',
    marginVertical: 10,
    elevation: 2,
  },
  logout: {
    marginTop: 30,
    width: '60%',
    alignSelf: 'center',
  },
});
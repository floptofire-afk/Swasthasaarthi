import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Text, ActivityIndicator, HelperText } from 'react-native-paper';
import firebase from '../firebase';

export default function MedicineHistoryScreen() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      setError('');
      try {
        const user = firebase.auth().currentUser;
        const snap = await firebase.firestore().collection('prescriptions').where('patientId', '==', user.uid).get();
        let meds = [];
        snap.docs.forEach(doc => {
          const data = doc.data();
          if (Array.isArray(data.medicines)) {
            data.medicines.forEach(med => {
              meds.push({ name: med, date: data.date || '' });
            });
          } else if (data.medicines) {
            meds.push({ name: data.medicines, date: data.date || '' });
          }
        });
        setMedicines(meds);
      } catch (e) {
        setError('Failed to fetch medicine history.');
      }
      setLoading(false);
    };
    fetchMedicines();
  }, []);

  if (loading) {
    return <ActivityIndicator animating size="large" style={{ marginTop: 40 }} />;
  }

  if (error) {
    return <HelperText type="error" style={{ marginTop: 40 }}>{error}</HelperText>;
  }

  if (!medicines.length) {
    return <Text style={{ marginTop: 40, textAlign: 'center' }}>No medicine history yet.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Medicine History</Title>
      {medicines.map((m, idx) => (
        <Card key={idx} style={styles.card}>
          <Card.Content>
            <Text>Medicine: {m.name}</Text>
            <Text>Date: {m.date}</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    color: '#1976d2',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
});
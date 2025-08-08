import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Text, ActivityIndicator, HelperText } from 'react-native-paper';
import firebase from '../firebase';

export default function PrescriptionsScreen() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      setError('');
      try {
        const user = firebase.auth().currentUser;
        const snap = await firebase.firestore().collection('prescriptions').where('patientId', '==', user.uid).get();
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPrescriptions(data);
      } catch (e) {
        setError('Failed to fetch prescriptions.');
      }
      setLoading(false);
    };
    fetchPrescriptions();
  }, []);

  if (loading) {
    return <ActivityIndicator animating size="large" style={{ marginTop: 40 }} />;
  }

  if (error) {
    return <HelperText type="error" style={{ marginTop: 40 }}>{error}</HelperText>;
  }

  if (!prescriptions.length) {
    return <Text style={{ marginTop: 40, textAlign: 'center' }}>No prescriptions yet.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Prescriptions</Title>
      {prescriptions.map((p) => (
        <Card key={p.id} style={styles.card}>
          <Card.Title title={`Doctor: ${p.doctorName || p.doctorId}`} subtitle={p.date} />
          <Card.Content>
            <Text>Diagnosis: {p.diagnosis}</Text>
            <Text>Medicines: {Array.isArray(p.medicines) ? p.medicines.join(', ') : p.medicines}</Text>
            {p.blockchainHash && <Text>Blockchain Hash: {p.blockchainHash}</Text>}
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
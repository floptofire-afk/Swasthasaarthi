// app/prescriptions.js - View prescriptions screen with Firestore integration
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Text, ActivityIndicator, Button, Paragraph } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function PrescriptionsScreen() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Fetch prescriptions from Firestore
  const fetchPrescriptions = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const q = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const prescriptionsList = [];
      
      querySnapshot.forEach((doc) => {
        prescriptionsList.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setPrescriptions(prescriptionsList);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Prescriptions Found</Text>
      <Paragraph style={styles.emptyText}>
        Your prescriptions will appear here once they are issued by a doctor.
      </Paragraph>
      <Button
        mode="outlined"
        style={styles.refreshButton}
        onPress={fetchPrescriptions}
      >
        Refresh
      </Button>
    </View>
  );

  // Render prescription card
  const renderPrescriptionCard = (prescription) => (
    <Card key={prescription.id} style={styles.prescriptionCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.doctorName}>
            Dr. {prescription.doctorName || 'Unknown Doctor'}
          </Text>
          <Text style={styles.date}>
            {new Date(prescription.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.cardSection}>
          <Text style={styles.sectionLabel}>Diagnosis:</Text>
          <Text style={styles.sectionText}>{prescription.diagnosis}</Text>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionLabel}>Medicines:</Text>
          {Array.isArray(prescription.medicines) ? (
            prescription.medicines.map((medicine, index) => (
              <Text key={index} style={styles.medicineItem}>
                • {medicine}
              </Text>
            ))
          ) : (
            <Text style={styles.sectionText}>{prescription.medicines}</Text>
          )}
        </View>

        {prescription.notes && (
          <View style={styles.cardSection}>
            <Text style={styles.sectionLabel}>Notes:</Text>
            <Text style={styles.sectionText}>{prescription.notes}</Text>
          </View>
        )}

        {prescription.blockchainHash && (
          <View style={styles.cardSection}>
            <Text style={styles.sectionLabel}>Blockchain Hash:</Text>
            <Text style={styles.hashText} numberOfLines={1}>
              {prescription.blockchainHash}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading prescriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={fetchPrescriptions}>
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.title}>My Prescriptions</Title>
        
        {prescriptions.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {prescriptions.map(renderPrescriptionCard)}
            <Button
              mode="outlined"
              style={styles.refreshButton}
              onPress={fetchPrescriptions}
            >
              Refresh
            </Button>
          </>
        )}

        <Button
          mode="text"
          style={styles.backButton}
          onPress={() => router.back()}
        >
          Back to Dashboard
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 24,
  },
  prescriptionCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  cardSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  medicineItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  hashText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  refreshButton: {
    marginTop: 20,
  },
  backButton: {
    marginTop: 16,
  },
});
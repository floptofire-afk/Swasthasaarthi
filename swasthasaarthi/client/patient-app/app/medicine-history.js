// app/medicine-history.js - Medicine history screen showing all issued medicines
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Card, Text, ActivityIndicator, Button, Paragraph } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function MedicineHistoryScreen() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchMedicineHistory();
  }, []);

  // Fetch medicine history from prescriptions
  const fetchMedicineHistory = async () => {
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
      const medicinesList = [];
      
      querySnapshot.forEach((doc) => {
        const prescription = doc.data();
        const prescriptionDate = new Date(prescription.createdAt).toLocaleDateString();
        
        // Extract medicines from prescription
        if (Array.isArray(prescription.medicines)) {
          prescription.medicines.forEach((medicine) => {
            medicinesList.push({
              id: `${doc.id}-${medicine}`,
              name: medicine,
              date: prescriptionDate,
              doctorName: prescription.doctorName || 'Unknown Doctor',
              diagnosis: prescription.diagnosis,
              prescriptionId: doc.id,
            });
          });
        } else if (prescription.medicines) {
          medicinesList.push({
            id: `${doc.id}-${prescription.medicines}`,
            name: prescription.medicines,
            date: prescriptionDate,
            doctorName: prescription.doctorName || 'Unknown Doctor',
            diagnosis: prescription.diagnosis,
            prescriptionId: doc.id,
          });
        }
      });

      setMedicines(medicinesList);
    } catch (err) {
      console.error('Error fetching medicine history:', err);
      setError('Failed to load medicine history');
    } finally {
      setLoading(false);
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Medicine History Found</Text>
      <Paragraph style={styles.emptyText}>
        Your medicine history will appear here once you receive prescriptions from doctors.
      </Paragraph>
      <Button
        mode="outlined"
        style={styles.refreshButton}
        onPress={fetchMedicineHistory}
      >
        Refresh
      </Button>
    </View>
  );

  // Render medicine card
  const renderMedicineCard = (medicine) => (
    <Card key={medicine.id} style={styles.medicineCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.date}>{medicine.date}</Text>
        </View>
        
        <View style={styles.cardDetails}>
          <Text style={styles.detailLabel}>Prescribed by:</Text>
          <Text style={styles.detailText}>Dr. {medicine.doctorName}</Text>
        </View>

        <View style={styles.cardDetails}>
          <Text style={styles.detailLabel}>For:</Text>
          <Text style={styles.detailText}>{medicine.diagnosis}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading medicine history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={fetchMedicineHistory}>
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.title}>Medicine History</Title>
        
        {medicines.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <Text style={styles.subtitle}>
              Total medicines issued: {medicines.length}
            </Text>
            {medicines.map(renderMedicineCard)}
            <Button
              mode="outlined"
              style={styles.refreshButton}
              onPress={fetchMedicineHistory}
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  medicineCard: {
    marginBottom: 12,
    elevation: 3,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  cardDetails: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
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
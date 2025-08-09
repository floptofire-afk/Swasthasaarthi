// app/book-appointment.js - Book appointment screen with date picker and PHC selection
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { Title, Button, Card, Text, ActivityIndicator, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const PHC_OPTIONS = [
  { id: 'phc1', name: 'Primary Health Center - Sector 1', address: 'Main Road, Sector 1' },
  { id: 'phc2', name: 'Primary Health Center - Sector 2', address: 'Central Avenue, Sector 2' },
  { id: 'phc3', name: 'Community Health Center - Central', address: 'Hospital Road, Central Area' },
];

export default function BookAppointmentScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPHC, setSelectedPHC] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Handle date selection
  const onDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  // Handle PHC selection
  const selectPHC = (phc) => {
    setSelectedPHC(phc);
    setError('');
  };

  // Book appointment
  const bookAppointment = async () => {
    if (!selectedPHC) {
      setError('Please select a PHC location');
      return;
    }

    // Check if selected date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError('Please select a future date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Save appointment to Firestore
      await addDoc(collection(db, 'appointments'), {
        patientId: user.uid,
        phcId: selectedPHC.id,
        phcName: selectedPHC.name,
        date: selectedDate.toISOString().split('T')[0],
        time: '09:00', // Default appointment time
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        'Success',
        `Appointment booked successfully for ${selectedDate.toDateString()} at ${selectedPHC.name}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Title style={styles.title}>Book Appointment</Title>
        
        {/* Date Selection */}
        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <Button
              mode="outlined"
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              {selectedDate.toDateString()}
            </Button>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </Card.Content>
        </Card>

        {/* PHC Selection */}
        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Select PHC Location</Text>
            {PHC_OPTIONS.map((phc) => (
              <Card
                key={phc.id}
                style={[
                  styles.phcCard,
                  selectedPHC?.id === phc.id && styles.selectedPHC
                ]}
                onPress={() => selectPHC(phc)}
              >
                <Card.Content>
                  <Text style={styles.phcName}>{phc.name}</Text>
                  <Text style={styles.phcAddress}>{phc.address}</Text>
                </Card.Content>
              </Card>
            ))}
          </Card.Content>
        </Card>

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
            style={styles.bookButton}
            onPress={bookAppointment}
            disabled={!selectedPHC}
          >
            Book Appointment
          </Button>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  dateButton: {
    marginTop: 8,
  },
  phcCard: {
    marginBottom: 12,
    elevation: 1,
  },
  selectedPHC: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
    borderWidth: 2,
  },
  phcName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  phcAddress: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 16,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    textAlign: 'center',
    marginTop: 10,
  },
});
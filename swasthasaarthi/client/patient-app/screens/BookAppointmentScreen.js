import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Button, Title, HelperText, ActivityIndicator, Snackbar, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import firebase from '../firebase';

const PHC_LIST = [
  { label: 'PHC 1', value: 'phc1' },
  { label: 'PHC 2', value: 'phc2' },
];

export default function BookAppointmentScreen({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [phc, setPhc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const onChange = (event, selectedDate) => {
    setShowDate(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const handleBook = async () => {
    setError('');
    setLoading(true);
    try {
      const user = firebase.auth().currentUser;
      await firebase.firestore().collection('appointments').add({
        patientId: user.uid,
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().split(' ')[0],
        phcId: phc,
      });
      setSuccess(true);
    } catch (e) {
      setError('Failed to book appointment.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Book Appointment</Title>
      <Button mode="outlined" onPress={() => setShowDate(true)} style={styles.input}>
        {date ? date.toDateString() : 'Select Date'}
      </Button>
      {showDate && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setMenuVisible(true)} style={styles.input}>
            {phc ? PHC_LIST.find(p => p.value === phc)?.label : 'Select PHC'}
          </Button>
        }
      >
        {PHC_LIST.map((item) => (
          <Menu.Item key={item.value} onPress={() => { setPhc(item.value); setMenuVisible(false); }} title={item.label} />
        ))}
      </Menu>
      {error ? <HelperText type="error">{error}</HelperText> : null}
      {loading ? (
        <ActivityIndicator animating size="large" style={{ marginVertical: 16 }} />
      ) : (
        <Button mode="contained" onPress={handleBook} style={styles.button} disabled={!phc}>
          Confirm Appointment
        </Button>
      )}
      <Snackbar visible={success} onDismiss={() => setSuccess(false)} duration={2000}>
        Appointment booked!
      </Snackbar>
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
  input: {
    width: '90%',
    marginVertical: 10,
  },
  button: {
    width: '90%',
    marginVertical: 16,
    paddingVertical: 8,
  },
});